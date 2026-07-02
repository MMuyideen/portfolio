const { app } = require('@azure/functions')
const { TableClient } = require('@azure/data-tables')

// Single-row counter: one entity holds the running total.
const PARTITION_KEY = 'counter'
const ROW_KEY = 'visits'
const MAX_RETRIES = 5

function getTableClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  const tableName = process.env.TABLE_NAME || 'visitors'
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured')
  }
  return TableClient.fromConnectionString(connectionString, tableName)
}

// Atomically increment the counter using optimistic concurrency (ETag).
// Retries on 412 (ETag conflict) and 409 (created concurrently).
async function incrementCount(client) {
  await client.createTable().catch(() => {
    /* table already exists — ignore */
  })

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let entity
    try {
      entity = await client.getEntity(PARTITION_KEY, ROW_KEY)
    } catch (err) {
      if (err.statusCode !== 404) throw err
      // First-ever hit: seed the entity.
      try {
        await client.createEntity({
          partitionKey: PARTITION_KEY,
          rowKey: ROW_KEY,
          count: 1,
        })
        return 1
      } catch (createErr) {
        if (createErr.statusCode === 409) continue // seeded by another request
        throw createErr
      }
    }

    const next = (Number(entity.count) || 0) + 1
    try {
      await client.updateEntity(
        { partitionKey: PARTITION_KEY, rowKey: ROW_KEY, count: next },
        'Replace',
        { etag: entity.etag },
      )
      return next
    } catch (updateErr) {
      if (updateErr.statusCode === 412) continue // stale ETag, re-read and retry
      throw updateErr
    }
  }

  throw new Error('Exceeded retry limit updating visitor count')
}

app.http('visitors', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'visitors',
  handler: async (request, context) => {
    try {
      const client = getTableClient()
      const count = await incrementCount(client)
      return {
        status: 200,
        jsonBody: { count },
        headers: { 'Cache-Control': 'no-store' },
      }
    } catch (err) {
      context.error('visitor counter failed:', err)
      return {
        status: 500,
        jsonBody: { error: 'counter_unavailable' },
      }
    }
  },
})
