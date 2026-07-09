import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
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
    const key = `../content/posts/${slug}/${src.replace(/^\.\//, '')}`
    const resolved = postImages[key]
    if (resolved) tokens[idx].attrSet('src', resolved)
  }
  tokens[idx].attrSet('loading', 'lazy')
  tokens[idx].attrSet('decoding', 'async')
  return defaultImage(tokens, idx, options, env, self)
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
