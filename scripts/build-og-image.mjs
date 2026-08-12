/**
 * Renders public/og-image.png — the card every shared link shows.
 *
 * Built rather than hand-designed so it can never drift from the brand again:
 * the monogram geometry is the same four paths as public/brand/*.svg, and the
 * type is the site's own DM Sans and Geist Mono, loaded straight out of
 * node_modules.
 *
 * Run with `npm run og:image`. Kept out of the default build because it needs a
 * local Chrome; the PNG is committed instead.
 *
 * Set CHROME_PATH to override browser discovery.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { copyFileSync, existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'public', 'og-image.png')

// Open Graph's expected aspect; anything square gets cropped by every network.
const WIDTH = 1200
const HEIGHT = 630

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

const FONTS = {
  'dm-sans.woff2': 'node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  'geist-mono.woff2':
    'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
}

const sleep = ms => new Promise(done => setTimeout(done, ms))

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'DM Sans';
    src: url('./dm-sans.woff2') format('woff2-variations');
    font-weight: 100 1000;
  }
  @font-face {
    font-family: 'Geist Mono';
    src: url('./geist-mono.woff2') format('woff2-variations');
    font-weight: 100 900;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    background: #0a0e14;
    color: #c9d1d9;
    font-family: 'DM Sans', system-ui, sans-serif;
    overflow: hidden;
    position: relative;
  }
  /* The hero's graticule and ambient phosphor glow, so the card reads as the
     same surface as the site it links to. */
  .grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(201,209,217,0.05) 1px, transparent 1px);
    background-size: 26px 26px;
    -webkit-mask-image: linear-gradient(to bottom, black, transparent 92%);
  }
  .glow {
    position: absolute; inset: 0;
    background: radial-gradient(760px 380px at 50% -120px, rgba(74,222,128,0.10), transparent 70%);
  }
  .frame {
    position: relative;
    height: 100%;
    padding: 76px 84px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .mark { width: 104px; height: 88px; color: #fff; }
  .name {
    font-size: 76px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.02;
    color: #fff;
  }
  .role {
    margin-top: 22px;
    font-family: 'Geist Mono', monospace;
    font-size: 27px;
    color: #4ade80;
  }
  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'Geist Mono', monospace;
    font-size: 21px;
    color: #6e7681;
  }
  .foot .site { color: #c9d1d9; }
  /* One accent hairline, echoing the nav's scroll indicator. */
  .rule { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: #4ade80; }
</style>
<div class="grid"></div>
<div class="glow"></div>
<div class="frame">
  <svg class="mark" viewBox="-14 -14 418 353" fill="none" stroke="currentColor"
       stroke-width="28" stroke-linejoin="miter" stroke-miterlimit="10">
    <path d="M14 325 V14 L127 91"/>
    <path d="M376 325 V14 L263 91"/>
    <path d="M85 325 V121 L196 208 L307 121 V325"/>
    <path d="M148 179 L196 139 L244 179"/>
  </svg>
  <div>
    <div class="name">Muyideen<br>Morenigbade</div>
    <div class="role">DevOps &amp; Cloud Engineer</div>
  </div>
  <div class="foot">
    <span class="site">muyideen.dev</span>
    <span>Azure · AWS · Terraform · Kubernetes</span>
  </div>
</div>
<div class="rule"></div>
`

const MIME = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2' }

function findChrome() {
  const found = CHROME_CANDIDATES.find(path => existsSync(path))
  if (!found) {
    throw new Error(
      `No Chrome found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}\nSet CHROME_PATH to your browser binary.`,
    )
  }
  return found
}

function serve(dir) {
  const server = createServer((req, res) => {
    const name = (req.url ?? '/').split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]
    const path = join(dir, name)
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

/** Same watchdog as the résumé printer: current Chrome does not reliably exit. */
function shoot(chrome, url, out, profile) {
  rmSync(out, { force: true })
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    '--force-prefers-reduced-motion',
    `--window-size=${WIDTH},${HEIGHT}`,
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

const chrome = findChrome()
const dir = await mkdtemp(join(tmpdir(), 'og-image-'))
writeFileSync(join(dir, 'index.html'), html)
for (const [name, source] of Object.entries(FONTS)) {
  const from = join(ROOT, source)
  if (!existsSync(from)) throw new Error(`Missing font ${source} — run npm install first.`)
  copyFileSync(from, join(dir, name))
}

const { server, port } = await serve(dir)
try {
  await shoot(chrome, `http://127.0.0.1:${port}/`, OUT, join(dir, 'profile'))
  const kb = Math.round(statSync(OUT).size / 1024)
  console.log(`[og] wrote public/og-image.png (${WIDTH}×${HEIGHT}, ${kb} KB)`)
} finally {
  server.close()
  await sleep(300)
  await rm(dir, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
