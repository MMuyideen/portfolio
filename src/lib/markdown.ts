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

/** Render a raw markdown string to sanitized HTML (html:false disables raw HTML). */
export function renderMarkdown(body: string): string {
  return md.render(body)
}
