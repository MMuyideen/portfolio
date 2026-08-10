/**
 * Renders /resume to public/resume.pdf using the print stylesheet in
 * src/styles/resume.css, so the downloadable PDF is generated from the same
 * data as the site and can never drift from it.
 *
 * Run `npm run build` first, then `npm run resume:pdf`. Kept out of the default
 * build because it needs a local Chrome; the generated PDF is committed instead.
 *
 * Set CHROME_PATH to override browser discovery.
 */
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const OUT = join(ROOT, 'public', 'resume.pdf')

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
].filter(Boolean)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * Resolve a request inside dist. The site is a client-routed SPA, so anything
 * that is not a real file falls back to index.html — the same rewrite
 * public/staticwebapp.config.json performs in production.
 */
function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0]))
  if (clean.includes('..')) return join(DIST, 'index.html')
  const path = join(DIST, clean)
  if (existsSync(path) && statSync(path).isFile()) return path
  return join(DIST, 'index.html')
}

function serve() {
  const server = createServer((req, res) => {
    const path = resolve(req.url ?? '/')
    if (!existsSync(path)) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, {
      'content-type': MIME[extname(path)] ?? 'application/octet-stream',
    })
    res.end(readFileSync(path))
  })
  return new Promise(resolvePort => {
    server.listen(0, '127.0.0.1', () =>
      resolvePort({ server, port: server.address().port }),
    )
  })
}

function findChrome() {
  const found = CHROME_CANDIDATES.find(path => existsSync(path))
  if (!found) {
    throw new Error(
      `No Chrome found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}\nSet CHROME_PATH to your browser binary.`,
    )
  }
  return found
}

const sleep = ms => new Promise(done => setTimeout(done, ms))

/**
 * Chrome's new headless mode (the only one left as of 151) writes the PDF but
 * does not always exit afterwards, so wait for the file to stop growing and
 * then terminate it ourselves rather than blocking forever on `exit`.
 */
function print(chrome, url, out, profile) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--no-pdf-header-footer',
    // Generous: React has to boot and the lazy /resume chunk has to load.
    '--virtual-time-budget=15000',
    `--print-to-pdf=${out}`,
    url,
  ]

  // Clear any previous render first, or the size-stability check below would
  // settle on the stale file and kill Chrome before it writes the new one.
  rmSync(out, { force: true })

  return new Promise((done, fail) => {
    const child = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    let settled = false
    const finish = fn => value => {
      if (settled) return
      settled = true
      child.kill()
      fn(value)
    }
    const resolveNow = finish(done)
    const reject = finish(fail)

    child.stderr.on('data', chunk => (stderr += chunk))
    child.on('error', reject)
    child.on('exit', code => {
      if (settled) return
      if (code === 0 && existsSync(out)) resolveNow()
      else reject(new Error(`Chrome exited ${code}\n${stderr}`))
    })
    ;(async () => {
      let previous = -1
      let stable = 0
      for (let elapsed = 0; elapsed < 60_000 && !settled; elapsed += 250) {
        await sleep(250)
        const size = existsSync(out) ? statSync(out).size : 0
        stable = size > 0 && size === previous ? stable + 1 : 0
        previous = size
        if (stable >= 2) return resolveNow()
      }
      reject(new Error(`Timed out waiting for ${out}\n${stderr}`))
    })()
  })
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('[resume] dist/index.html missing — run `npm run build` first.')
  process.exit(1)
}

const chrome = findChrome()
const profile = await mkdtemp(join(tmpdir(), 'resume-pdf-'))
const { server, port } = await serve()

try {
  await print(chrome, `http://127.0.0.1:${port}/resume`, OUT, profile)
  copyFileSync(OUT, join(DIST, 'resume.pdf'))
  const kb = Math.round(statSync(OUT).size / 1024)
  console.log(`[resume] wrote public/resume.pdf (${kb} KB) via ${chrome}`)
} finally {
  server.close()
  // Chrome may still be releasing the profile as it tears down; it is a temp
  // directory either way, so never fail the build over it.
  await sleep(500)
  await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
