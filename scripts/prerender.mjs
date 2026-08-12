/**
 * Prerenders every route to static HTML after the Vite build.
 *
 * The site is a client-routed SPA, so without this every URL serves the same
 * index.html — meaning the per-route <title>, description, canonical, OG tags
 * and JSON-LD only exist after React boots. Googlebot renders JS and mostly
 * recovers, but social scrapers (LinkedIn, X, Slack, WhatsApp) do not, so every
 * shared link showed the home page's card.
 *
 * Each route is loaded in headless Chrome and its rendered DOM written to
 * dist/<route>/index.html. Azure Static Web Apps serves those files directly;
 * the navigationFallback in staticwebapp.config.json only applies to paths that
 * do not match a file, so no config change is needed.
 *
 * Routes come from dist/sitemap.xml — generated moments earlier by
 * generate-sitemap.mjs — so the two can never disagree about what exists.
 *
 * Set CHROME_PATH to override browser discovery.
 */
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')
const SITE_URL = 'https://www.muyideen.dev'

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

const sleep = ms => new Promise(done => setTimeout(done, ms))

/**
 * Routes to render that are deliberately absent from the sitemap.
 *
 * /resume is not a public page — nothing links to it and it is noindex — but
 * scripts/build-resume-pdf.mjs prints the PDF from it, and printing a static
 * file is far more reliable than waiting on the SPA fallback to boot React,
 * load the route chunk and apply its stylesheet.
 */
const EXTRA_ROUTES = ['/resume']

/** Every path in the sitemap, as site-relative routes ("/", "/blog", …). */
function routesFromSitemap() {
  const sitemap = join(DIST, 'sitemap.xml')
  if (!existsSync(sitemap)) {
    throw new Error('dist/sitemap.xml missing — generate-sitemap.mjs runs first in `npm run build`.')
  }
  const xml = readFileSync(sitemap, 'utf8')
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => loc.replace(SITE_URL, '').replace(/\/$/, '') || '/')
  return [...new Set([...routes, ...EXTRA_ROUTES])]
}

/**
 * Serve dist with the SPA fallback, mirroring staticwebapp.config.json.
 *
 * `shell` is the untouched Vite index.html, captured before the first route is
 * written. It matters: "/" is rendered first and its output overwrites
 * dist/index.html, so a naive fallback would hand every later route a document
 * that already carries the home page's <title>, canonical and og:* tags.
 * react-helmet-async appends to that head rather than clearing it, and the
 * stale tags come first — which is exactly the duplication index.html was
 * stripped down to avoid. Serving the shell keeps each route's head its own.
 */
function serve(shell) {
  const server = createServer((req, res) => {
    const clean = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]))
    const path = clean.includes('..') ? null : join(DIST, clean)
    if (!path || !existsSync(path) || !statSync(path).isFile()) {
      res.writeHead(200, { 'content-type': MIME['.html'] })
      res.end(shell)
      return
    }
    res.writeHead(200, {
      'content-type': MIME[extname(path)] ?? 'application/octet-stream',
    })
    res.end(readFileSync(path))
  })
  return new Promise(done => {
    server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port }))
  })
}

function findChrome() {
  const found = CHROME_CANDIDATES.find(path => existsSync(path))
  if (!found) {
    throw new Error(
      `No Chrome found — cannot prerender. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}\n` +
        'Set CHROME_PATH, or run `npm run build:spa` to skip prerendering.',
    )
  }
  return found
}

/**
 * Render one route and return its DOM.
 *
 * `--force-prefers-reduced-motion` is what makes the output usable: the app
 * wraps everything in <MotionConfig reducedMotion="user">, so under that flag
 * Framer Motion renders final states immediately instead of baking half-played
 * entrance animations (opacity: 0 on everything below the fold) into the HTML.
 */
function render(chrome, url, profile) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    '--force-prefers-reduced-motion',
    '--hide-scrollbars',
    // Tall viewport so viewport-triggered content has rendered by capture time.
    '--window-size=1440,3000',
    '--virtual-time-budget=12000',
    '--dump-dom',
    url,
  ]
  return new Promise((done, fail) => {
    const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let html = ''
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

    child.stdout.on('data', chunk => (html += chunk))
    child.stderr.on('data', chunk => (stderr += chunk))
    child.on('error', reject)
    child.on('exit', () =>
      html.includes('</html>')
        ? resolve(html)
        : reject(new Error(`Empty render for ${url}\n${stderr.slice(-500)}`)),
    )
    ;(async () => {
      for (let waited = 0; waited < 45_000 && !settled; waited += 500) {
        await sleep(500)
        if (html.includes('</html>')) return resolve(html)
      }
      reject(new Error(`Timed out rendering ${url}\n${stderr.slice(-500)}`))
    })()
  })
}

/** dist/index.html for "/", dist/<route>/index.html for everything else. */
function outputPath(route) {
  if (route === '/') return join(DIST, 'index.html')
  const dir = join(DIST, route)
  mkdirSync(dir, { recursive: true })
  return join(dir, 'index.html')
}

/** A rendered page is only useful if it carries its own title. */
function titleOf(html) {
  return html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1] ?? ''
}

const chrome = findChrome()
const routes = routesFromSitemap()
const profile = await mkdtemp(join(tmpdir(), 'prerender-'))
// Read before anything is written — see serve().
const shell = readFileSync(join(DIST, 'index.html'))
const { server, port } = await serve(shell)

let failures = 0
try {
  for (const route of routes) {
    try {
      const html = await render(chrome, `http://127.0.0.1:${port}${route}`, profile)
      writeFileSync(outputPath(route), html)
      const kb = Math.round(Buffer.byteLength(html) / 1024)
      console.log(`[prerender] ${route.padEnd(48)} ${String(kb).padStart(4)} KB  ${titleOf(html).slice(0, 60)}`)
    } catch (error) {
      failures += 1
      console.error(`[prerender] FAILED ${route}: ${error.message}`)
    }
  }
} finally {
  server.close()
  await sleep(500)
  await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}

if (failures > 0) {
  console.error(`[prerender] ${failures} of ${routes.length} route(s) failed`)
  process.exit(1)
}
console.log(`[prerender] ${routes.length} route(s) written to dist/`)
