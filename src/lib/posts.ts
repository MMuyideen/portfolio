import matter from 'gray-matter'

/** A single blog post: parsed frontmatter plus the raw markdown body. */
export interface Post {
  /** URL slug, derived from the markdown filename (without extension). */
  slug: string
  title: string
  /** ISO date string, e.g. "2026-06-18". */
  date: string
  excerpt: string
  tags: string[]
  draft: boolean
  /** Estimated reading time in whole minutes (>= 1). */
  readingTime: number
  /** Raw markdown body (frontmatter stripped). Rendered lazily by the post page. */
  body: string
}

/** Words per minute used to estimate reading time. */
const WORDS_PER_MINUTE = 200

/**
 * Eagerly load every markdown file under content/posts as a raw string.
 * Vite inlines these at build time, so there is no runtime fetch.
 */
const rawPosts = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '')
}

function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toPost(path: string, raw: string): Post {
  const { data, content } = matter(raw)
  const frontmatter = data as Partial<{
    title: string
    date: string
    excerpt: string
    tags: string[]
    draft: boolean
    readingTime: number
  }>

  return {
    slug: slugFromPath(path),
    title: frontmatter.title ?? 'Untitled',
    date: frontmatter.date ?? '1970-01-01',
    excerpt: frontmatter.excerpt ?? '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    draft: frontmatter.draft === true,
    readingTime: frontmatter.readingTime ?? estimateReadingTime(content),
    body: content,
  }
}

/** Every post parsed once, module-level, keyed by slug. */
const allPosts: Post[] = Object.entries(rawPosts).map(([path, raw]) =>
  toPost(path, raw),
)

/** Non-draft posts, newest first. */
export function getAllPosts(): Post[] {
  return allPosts
    .filter(post => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
}

/** Look up a single non-draft post by slug, or undefined if unknown. */
export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find(post => post.slug === slug)
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
