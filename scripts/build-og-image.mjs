/**
 * Renders the cards shared links show:
 *
 *   public/og-image.png        the site card — name, role, stack
 *   public/og/<slug>.png       one per published post — title, date, tags
 *
 * Built rather than hand-designed so they can never drift from the brand: the
 * monogram geometry comes from scripts/lib/monogram.mjs (the same four paths as
 * src/components/Monogram.tsx and public/brand/*.svg), the post list from the
 * same frontmatter loader the sitemap and feed use, and the type is the site's
 * own DM Sans and Geist Mono, loaded straight out of node_modules.
 *
 * Run with `npm run og:image`. Kept out of the default build because it needs a
 * local Chrome; the PNGs are committed instead.
 *
 * Set CHROME_PATH to override browser discovery.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { markFragment } from './lib/monogram.mjs'
import { findChrome, serve, shoot, sleep } from './lib/chrome.mjs'
import { loadPosts } from './lib/posts.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, 'public')
const SITE_CARD = join(PUBLIC, 'og-image.png')
const POST_CARDS = join(PUBLIC, 'og')

// Open Graph's expected aspect; anything square gets cropped by every network.
const WIDTH = 1200
const HEIGHT = 630

const ROLE = 'Cloud Platform & DevOps Engineer'

const FONTS = {
  'dm-sans.woff2': 'node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  'geist-mono.woff2':
    'node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
}

const escapeHtml = s =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** "2026-07-09" → "9 July 2026". Undefined dates simply drop off the card. */
function formatDate(iso) {
  if (!iso) return ''
  const parsed = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Post titles here run from 34 to 76 characters, and a card that reflows to
 * five lines reads as an accident. Stepping the size down by length keeps every
 * title inside three lines without measuring text.
 */
function titleSize(title) {
  if (title.length <= 34) return 68
  if (title.length <= 52) return 58
  if (title.length <= 72) return 50
  return 44
}

/** Shared chrome: fonts, the hero's graticule, the glow, the accent hairline. */
const shell = body => `<!doctype html>
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
    color: #7d8590;
  }
  .foot .site { color: #c9d1d9; }
  /* One accent hairline, echoing the nav's scroll indicator. */
  .rule { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: #4ade80; }

  /* ── Post cards ─────────────────────────────────────────────────────────── */
  /* The mark shares a row with the kicker rather than standing alone, so the
     title gets the vertical space the name has on the site card. */
  .head { display: flex; align-items: center; gap: 20px; }
  .kicker {
    font-family: 'Geist Mono', monospace;
    font-size: 20px;
    letter-spacing: 0.08em;
    color: #4ade80;
  }
  .title {
    font-weight: 700;
    letter-spacing: -0.022em;
    line-height: 1.12;
    color: #fff;
    /* Three lines is the most that fits above the footer at the smallest step;
       a longer title is clipped rather than allowed to push the layout. */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tags {
    margin-top: 26px;
    display: flex;
    gap: 10px;
    font-family: 'Geist Mono', monospace;
    font-size: 19px;
    color: #7d8590;
  }
  .tags span {
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 6px;
    padding: 6px 12px;
    background: #11161f;
    white-space: nowrap;
  }
</style>
<div class="grid"></div>
<div class="glow"></div>
<div class="frame">
${body}
</div>
<div class="rule"></div>
`

const siteCard = () =>
  shell(`  ${markFragment({ style: 'width:104px;height:88px;color:#fff' })}
  <div>
    <div class="name">Muyideen<br>Morenigbade</div>
    <div class="role">${escapeHtml(ROLE)}</div>
  </div>
  <div class="foot">
    <span class="site">muyideen.dev</span>
    <span>Azure · AWS · Terraform · Kubernetes</span>
  </div>`)

const postCard = post =>
  shell(`  <div class="head">
    ${markFragment({ style: 'width:54px;height:46px;color:#fff' })}
    <span class="kicker">$ cat blog/${escapeHtml(post.slug)}.md</span>
  </div>
  <div>
    <div class="title" style="font-size:${titleSize(post.title)}px">${escapeHtml(post.title)}</div>
    <div class="tags">
      ${post.tags
        .slice(0, 4)
        .map(tag => `<span>${escapeHtml(tag)}</span>`)
        .join('\n      ')}
    </div>
  </div>
  <div class="foot">
    <span class="site">Muyideen Morenigbade</span>
    <span>${escapeHtml(formatDate(post.date))}</span>
  </div>`)

const posts = loadPosts(ROOT)
const chrome = findChrome()
const dir = await mkdtemp(join(tmpdir(), 'og-image-'))
for (const [name, source] of Object.entries(FONTS)) {
  const from = join(ROOT, source)
  if (!existsSync(from)) throw new Error(`Missing font ${source} — run npm install first.`)
  copyFileSync(from, join(dir, name))
}
if (!existsSync(POST_CARDS)) mkdirSync(POST_CARDS, { recursive: true })

const cards = [
  { name: 'og-image.png', out: SITE_CARD, html: siteCard() },
  ...posts.map(post => ({
    name: `og/${post.slug}.png`,
    out: join(POST_CARDS, `${post.slug}.png`),
    html: postCard(post),
  })),
]

const { server, port } = await serve(dir)
try {
  for (const card of cards) {
    writeFileSync(join(dir, 'index.html'), card.html)
    await shoot(chrome, `http://127.0.0.1:${port}/?${encodeURIComponent(card.name)}`, card.out, {
      // A profile per card: the previous Chrome is killed, not awaited, and a
      // still-held lock on a shared profile would fail the next run.
      profile: join(dir, `profile-${card.name.replace(/[^a-z0-9]+/gi, '-')}`),
      width: WIDTH,
      height: HEIGHT,
    })
    const kb = Math.round(statSync(card.out).size / 1024)
    console.log(`[og] wrote public/${card.name} (${WIDTH}×${HEIGHT}, ${kb} KB)`)
  }

  // A renamed or unpublished post would otherwise leave its card behind, still
  // served and still referenced by anything that scraped the old URL.
  const expected = new Set(posts.map(post => `${post.slug}.png`))
  for (const file of readdirSync(POST_CARDS)) {
    if (file.endsWith('.png') && !expected.has(file)) {
      rmSync(join(POST_CARDS, file))
      console.log(`[og] removed stale public/og/${file}`)
    }
  }
} finally {
  server.close()
  await sleep(300)
  await rm(dir, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
