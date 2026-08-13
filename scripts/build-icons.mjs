/**
 * Renders the raster app icons from the monogram geometry.
 *
 *   public/apple-touch-icon.png       180  iOS home screen (iOS rounds it)
 *   public/icons/icon-192.png         192  manifest, purpose "any"
 *   public/icons/icon-512.png         512  manifest, purpose "any"
 *   public/icons/icon-maskable.png    512  manifest, purpose "maskable"
 *
 * Generated rather than exported by hand so they cannot drift from
 * scripts/lib/monogram.mjs — which is the same path data as
 * src/components/Monogram.tsx and public/brand/mm-mark-*.svg.
 *
 * Run with `npm run icons`. Kept out of the default build because it needs a
 * local Chrome; the PNGs are committed instead.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { ASPECT, markFragment } from './lib/monogram.mjs'
import { findChrome, serve, shoot, sleep } from './lib/chrome.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, 'public')
const ICONS = join(PUBLIC, 'icons')

/** The mark's dark chip. The artifact's ink, not the site's #0a0e14 page. */
const CHIP = '#0E0D11'

/**
 * `scale` is the mark's width as a fraction of the canvas.
 *
 * The maskable icon is the constraint: Android may crop it to a circle of 80%
 * diameter, so everything that must survive has to sit inside that circle. At
 * scale 0.52 on 512 the mark's box is 266 × 225, a 348px diagonal against a
 * 409px safe circle — comfortable at any mask shape. The others are only ever
 * shown whole, so they can breathe wider.
 */
const ICONS_TO_BUILD = [
  { file: join(PUBLIC, 'apple-touch-icon.png'), size: 180, scale: 0.7, radius: 0 },
  { file: join(ICONS, 'icon-192.png'), size: 192, scale: 0.64, radius: 0.11 },
  { file: join(ICONS, 'icon-512.png'), size: 512, scale: 0.64, radius: 0.11 },
  { file: join(ICONS, 'icon-maskable.png'), size: 512, scale: 0.52, radius: 0 },
]

function page({ size, scale, radius }) {
  const markWidth = Math.round(size * scale)
  return `<!doctype html>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; background: transparent; }
  .chip {
    width: ${size}px;
    height: ${size}px;
    border-radius: ${Math.round(size * radius)}px;
    background: ${CHIP};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg { width: ${markWidth}px; height: ${Math.round(markWidth / ASPECT)}px; display: block; }
</style>
<div class="chip">${markFragment({ color: '#FFFFFF' })}</div>
`
}

const chrome = findChrome()
const dir = await mkdtemp(join(tmpdir(), 'icons-'))
if (!existsSync(ICONS)) mkdirSync(ICONS, { recursive: true })

const { server, port } = await serve(dir)
try {
  for (const icon of ICONS_TO_BUILD) {
    writeFileSync(join(dir, 'index.html'), page(icon))
    await shoot(chrome, `http://127.0.0.1:${port}/?${icon.size}-${icon.scale}`, icon.file, {
      // A profile per icon: the previous Chrome is killed, not awaited, and a
      // still-held lock on a shared profile would fail the next run.
      profile: join(dir, `profile-${icon.size}-${icon.scale}`),
      width: icon.size,
      height: icon.size,
      transparent: true,
    })
    const kb = (statSync(icon.file).size / 1024).toFixed(1)
    console.log(`[icons] wrote ${icon.file.replace(ROOT, '')} (${icon.size}², ${kb} KB)`)
  }
} finally {
  server.close()
  await sleep(300)
  await rm(dir, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
}
