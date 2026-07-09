import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import matter from 'gray-matter'

const POSTS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  'src',
  'content',
  'posts',
)
const VIRTUAL_ID = 'virtual:post-meta'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const DIMS_VIRTUAL_ID = 'virtual:post-image-dims'
const DIMS_RESOLVED_ID = '\0' + DIMS_VIRTUAL_ID

/** Words per minute used to estimate reading time. */
const WORDS_PER_MINUTE = 200

function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

/**
 * Every post lives in src/content/posts/<slug>/index.md (images alongside),
 * with legacy flat <slug>.md files still supported. Returns frontmatter-only
 * metadata; bodies are loaded lazily by the blog-post route.
 */
function loadPostMeta() {
  const posts = []
  for (const entry of readdirSync(POSTS_DIR)) {
    if (entry.startsWith('.')) continue
    const entryPath = join(POSTS_DIR, entry)
    let slug: string
    let file: string
    if (statSync(entryPath).isDirectory()) {
      slug = entry
      file = join(entryPath, 'index.md')
      if (!existsSync(file)) continue
    } else if (entry.endsWith('.md')) {
      slug = entry.replace(/\.md$/, '')
      file = entryPath
    } else {
      continue
    }
    const { data, content } = matter(readFileSync(file, 'utf8'))
    posts.push({
      slug,
      title: data.title ?? 'Untitled',
      date: typeof data.date === 'string' ? data.date : '1970-01-01',
      excerpt: data.excerpt ?? '',
      // Drop empty placeholder tags and duplicates (both break rendering).
      tags: Array.isArray(data.tags)
        ? [...new Set(data.tags.filter(t => typeof t === 'string' && t.trim() !== ''))]
        : [],
      draft: data.draft === true,
      readingTime: data.readingTime ?? estimateReadingTime(content),
    })
  }
  return posts
}

/** Width/height from a PNG's IHDR chunk, or null for anything else. */
function pngDims(file: string): [number, number] | null {
  const buf = readFileSync(file)
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)]
}

/**
 * Intrinsic dimensions for every post image, keyed by `<slug>/<filename>`.
 * The markdown renderer writes them as width/height attributes so lazy-loaded
 * screenshots don't cause layout shift while reading.
 */
function loadImageDims() {
  const dims: Record<string, [number, number]> = {}
  for (const entry of readdirSync(POSTS_DIR)) {
    if (entry.startsWith('.')) continue
    const entryPath = join(POSTS_DIR, entry)
    if (!statSync(entryPath).isDirectory()) continue
    for (const file of readdirSync(entryPath)) {
      if (!/\.png$/i.test(file)) continue
      const d = pngDims(join(entryPath, file))
      if (d) dims[`${entry}/${file}`] = d
    }
  }
  return dims
}

/**
 * Exposes post frontmatter as `virtual:post-meta` and image dimensions as
 * `virtual:post-image-dims`, both computed at build time so gray-matter (and
 * its Node Buffer dependency) never ships to the browser.
 */
function postMeta(): Plugin {
  return {
    name: 'post-meta',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      if (id === DIMS_VIRTUAL_ID) return DIMS_RESOLVED_ID
      return undefined
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return `export const posts = ${JSON.stringify(loadPostMeta())}`
      }
      if (id === DIMS_RESOLVED_ID) {
        return `export const imageDims = ${JSON.stringify(loadImageDims())}`
      }
      return undefined
    },
    // Dev only: editing a post re-reads frontmatter on the next page load.
    handleHotUpdate({ file, server }) {
      if (!file.includes('/content/posts/')) return
      for (const id of [RESOLVED_ID, DIMS_RESOLVED_ID]) {
        const mod = server.moduleGraph.getModuleById(id)
        if (mod) server.moduleGraph.invalidateModule(mod)
      }
      server.ws.send({ type: 'full-reload' })
      return []
    },
  }
}

export default defineConfig({
  plugins: [react(), postMeta()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
