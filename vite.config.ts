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

/**
 * Exposes post frontmatter as `virtual:post-meta`, parsed at build time so
 * gray-matter (and its Node Buffer dependency) never ships to the browser.
 */
function postMeta(): Plugin {
  return {
    name: 'post-meta',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined
      return `export const posts = ${JSON.stringify(loadPostMeta())}`
    },
    // Dev only: editing a post re-reads frontmatter on the next page load.
    handleHotUpdate({ file, server }) {
      if (!file.includes('/content/posts/')) return
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) server.moduleGraph.invalidateModule(mod)
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
