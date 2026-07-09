import { posts as allPosts } from 'virtual:post-meta'

/**
 * Post frontmatter, parsed at build time by the `post-meta` Vite plugin
 * (see vite.config.ts). Bodies are not bundled here — `loadPostBody` pulls
 * each post's markdown in lazily so the home route ships metadata only.
 */
export interface PostMeta {
  /** URL slug: the post's folder name under content/posts. */
  slug: string
  title: string
  /** ISO date string, e.g. "2026-06-18". */
  date: string
  excerpt: string
  tags: string[]
  draft: boolean
  /** Estimated reading time in whole minutes (>= 1). */
  readingTime: number
}

/**
 * Lazy raw-body loaders, one code-split chunk per post. Posts live in
 * content/posts/<slug>/index.md with images alongside; flat <slug>.md files
 * are still supported.
 */
const bodyLoaders = import.meta.glob(
  ['../content/posts/*/index.md', '../content/posts/*.md'],
  { query: '?raw', import: 'default' },
) as Record<string, () => Promise<string>>

/** Non-draft posts, newest first. */
export function getAllPosts(): PostMeta[] {
  return allPosts
    .filter(post => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Look up a single non-draft post by slug, or undefined if unknown. */
export function getPostBySlug(slug: string): PostMeta | undefined {
  return getAllPosts().find(post => post.slug === slug)
}

/** Strip the leading `--- ... ---` frontmatter block from raw markdown. */
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

/** Fetch and return a post's markdown body (frontmatter removed). */
export async function loadPostBody(slug: string): Promise<string> {
  const loader =
    bodyLoaders[`../content/posts/${slug}/index.md`] ??
    bodyLoaders[`../content/posts/${slug}.md`]
  if (!loader) throw new Error(`No post body found for slug "${slug}"`)
  return stripFrontmatter(await loader())
}

/**
 * Format an ISO date as e.g. "18 Jun 2026" for display.
 * Parsed as UTC so the rendered day never shifts by timezone.
 */
export function formatPostDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
