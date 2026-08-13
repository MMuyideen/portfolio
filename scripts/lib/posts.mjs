/**
 * Reads published blog posts off disk.
 *
 * Shared by scripts/generate-sitemap.mjs and scripts/build-og-image.mjs so the
 * feed, the sitemap and the per-post social cards are all driven by the same
 * frontmatter — a post can never appear in one and be missing from another.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

/**
 * Posts live in src/content/posts/<slug>/index.md (images alongside); flat
 * <slug>.md files are still supported. Drafts are excluded. Newest first.
 */
export function loadPosts(root) {
  const postsDir = join(root, 'src', 'content', 'posts')
  const posts = []
  for (const entry of readdirSync(postsDir)) {
    if (entry.startsWith('.')) continue
    const entryPath = join(postsDir, entry)
    let slug
    let file
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
    const { data } = matter(readFileSync(file, 'utf8'))
    if (data.draft === true) continue
    posts.push({
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      date: typeof data.date === 'string' ? data.date : undefined,
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
      tags: Array.isArray(data.tags) ? data.tags.filter(t => typeof t === 'string') : [],
    })
  }
  return posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}
