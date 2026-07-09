/**
 * Astro inlines its island-hydration bootstrap scripts, which a strict
 * `script-src 'self'` CSP would block. Instead of allowing 'unsafe-inline',
 * hash every inline script in the built HTML and add the sha256 sources to
 * the CSP in dist/staticwebapp.config.json. Runs as part of `npm run build`.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = new URL('../dist', import.meta.url).pathname

function htmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...htmlFiles(path))
    else if (entry.name.endsWith('.html')) out.push(path)
  }
  return out
}

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g

const hashes = new Set()
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8')
  for (const [, body] of html.matchAll(INLINE_SCRIPT)) {
    if (body.trim() === '') continue
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }
}

const configPath = join(DIST, 'staticwebapp.config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const csp = config.globalHeaders['Content-Security-Policy']
config.globalHeaders['Content-Security-Policy'] = csp.replace(
  /script-src 'self'/,
  `script-src 'self' ${[...hashes].sort().join(' ')}`.trimEnd(),
)
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

console.log(`[csp] hashed ${hashes.size} inline script(s) into staticwebapp.config.json`)
