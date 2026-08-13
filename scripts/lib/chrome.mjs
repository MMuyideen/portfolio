/**
 * Headless-Chrome screenshotting, shared by the scripts that render brand
 * assets (scripts/build-og-image.mjs, scripts/build-icons.mjs).
 *
 * Both need the same three things: find a browser, serve a directory over
 * loopback so @font-face and relative URLs resolve, and screenshot a page
 * without waiting forever for a browser that may never exit on its own.
 *
 * Set CHROME_PATH to override browser discovery.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

export const sleep = ms => new Promise(done => setTimeout(done, ms))

export function findChrome() {
  const found = CHROME_CANDIDATES.find(path => existsSync(path))
  if (!found) {
    throw new Error(
      `No Chrome found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}\nSet CHROME_PATH to your browser binary.`,
    )
  }
  return found
}

/** Serve `dir` on an ephemeral loopback port. `/` resolves to index.html. */
export function serve(dir) {
  const server = createServer((req, res) => {
    const requested = (req.url ?? '/').split('?')[0]
    const path = join(dir, requested === '/' ? '/index.html' : requested)
    if (!existsSync(path)) {
      res.writeHead(404).end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' })
    res.end(readFileSync(path))
  })
  return new Promise(done => {
    server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port }))
  })
}

/**
 * Screenshot `url` to `out` at `width` × `height`.
 *
 * Current Chrome does not reliably exit after --screenshot, so alongside the
 * exit handler a watchdog polls the output file and resolves once its size has
 * stopped changing — the same approach scripts/build-resume-pdf.mjs uses.
 */
export function shoot(chrome, url, out, { profile, width, height, transparent = false }) {
  rmSync(out, { force: true })
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    '--force-prefers-reduced-motion',
    // Without this Chrome paints an opaque white base layer, so a page with a
    // transparent body screenshots with white corners.
    ...(transparent ? ['--default-background-color=00000000'] : []),
    `--window-size=${width},${height}`,
    `--screenshot=${out}`,
    '--virtual-time-budget=8000',
    url,
  ]
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
    const resolve = finish(done)
    const reject = finish(fail)
    child.stderr.on('data', chunk => (stderr += chunk))
    child.on('error', reject)
    child.on('exit', code =>
      code === 0 && existsSync(out)
        ? resolve()
        : reject(new Error(`Chrome exited ${code}\n${stderr.slice(-400)}`)),
    )
    ;(async () => {
      let previous = -1
      let stable = 0
      for (let waited = 0; waited < 45_000 && !settled; waited += 250) {
        await sleep(250)
        const size = existsSync(out) ? statSync(out).size : 0
        stable = size > 0 && size === previous ? stable + 1 : 0
        previous = size
        if (stable >= 2) return resolve()
      }
      reject(new Error(`Timed out rendering ${url}\n${stderr.slice(-400)}`))
    })()
  })
}
