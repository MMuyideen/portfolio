import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import { imageDims } from 'virtual:post-image-dims'
import 'highlight.js/styles/github-dark.css'

/**
 * Markdown renderer for post bodies. Lives in its own module so that
 * markdown-it + highlight.js are code-split into the blog-post chunk and
 * never weigh down the home route (which only needs post metadata).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlight(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const { value } = hljs.highlight(code, { language: lang, ignoreIllegals: true })
      return `<pre class="hljs"><code class="hljs language-${lang}">${value}</code></pre>`
    } catch {
      /* fall through to the escaped default */
    }
  }
  return `<pre class="hljs"><code class="hljs">${escapeHtml(code)}</code></pre>`
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight,
})

/**
 * Hashed asset URLs for images that live alongside a post's index.md
 * (content/posts/<slug>/<image>). Vite emits the files and inlines the URLs;
 * this map lets relative `![](./image.png)` references resolve after build.
 */
const postImages = import.meta.glob(
  '../content/posts/*/*.{png,jpg,jpeg,gif,svg,webp,avif}',
  { query: '?url', import: 'default', eager: true },
) as Record<string, string>

const defaultImage =
  md.renderer.rules.image ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const src = tokens[idx].attrGet('src') ?? ''
  const slug = (env as { slug?: string } | undefined)?.slug
  if (slug && !/^(https?:)?\/\//.test(src) && !src.startsWith('data:')) {
    const file = src.replace(/^\.\//, '')
    const resolved = postImages[`../content/posts/${slug}/${file}`]
    if (resolved) tokens[idx].attrSet('src', resolved)
    // Intrinsic dimensions (build-time) prevent layout shift on lazy load.
    const dims = imageDims[`${slug}/${file}`]
    if (dims) {
      tokens[idx].attrSet('width', String(dims[0]))
      tokens[idx].attrSet('height', String(dims[1]))
    }
  }
  tokens[idx].attrSet('loading', 'lazy')
  tokens[idx].attrSet('decoding', 'async')
  return defaultImage(tokens, idx, options, env, self)
}

// ── Heading ids + hover anchors + table of contents ──────────────────────────

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-') || 'section'
  )
}

/** Assign a unique slug, tracking duplicates per document via `counts`. */
function uniqueSlug(text: string, counts: Record<string, number>): string {
  let slug = slugifyHeading(text)
  counts[slug] = (counts[slug] ?? 0) + 1
  if (counts[slug] > 1) slug = `${slug}-${counts[slug]}`
  return slug
}

interface HeadingEnv {
  slug?: string
  slugCounts?: Record<string, number>
  lastHeadingSlug?: string
}

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  if (token.tag === 'h2' || token.tag === 'h3') {
    const headingEnv = env as HeadingEnv
    headingEnv.slugCounts ??= {}
    const slug = uniqueSlug(tokens[idx + 1]?.content ?? '', headingEnv.slugCounts)
    token.attrSet('id', slug)
    headingEnv.lastHeadingSlug = slug
  }
  return self.renderToken(tokens, idx, options)
}

md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const headingEnv = env as HeadingEnv
  let anchor = ''
  if ((token.tag === 'h2' || token.tag === 'h3') && headingEnv.lastHeadingSlug) {
    anchor = `<a class="heading-anchor" href="#${headingEnv.lastHeadingSlug}" aria-label="Link to this section">#</a>`
    headingEnv.lastHeadingSlug = undefined
  }
  return anchor + self.renderToken(tokens, idx, options)
}

export interface TocEntry {
  level: 2 | 3
  text: string
  slug: string
}

/**
 * h2/h3 outline of a post. Uses the same slug algorithm (and duplicate
 * counting) as the renderer, so TOC links always match the rendered ids.
 */
export function extractToc(body: string): TocEntry[] {
  const counts: Record<string, number> = {}
  const toc: TocEntry[] = []
  const tokens = md.parse(body, {})
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type !== 'heading_open' || (token.tag !== 'h2' && token.tag !== 'h3')) continue
    const text = tokens[i + 1]?.content ?? ''
    toc.push({
      level: token.tag === 'h2' ? 2 : 3,
      text,
      slug: uniqueSlug(text, counts),
    })
  }
  return toc
}

// Open external links in a new, safe tab.
const defaultLinkOpen =
  md.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') ?? ''
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

/**
 * Render a raw markdown string to sanitized HTML (html:false disables raw
 * HTML). Pass the post's slug so relative image references (./image.png)
 * resolve to the hashed assets in its content folder.
 */
export function renderMarkdown(body: string, slug?: string): string {
  return md.render(body, { slug })
}
