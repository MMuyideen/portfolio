import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { Lightbox } from '../components/Lightbox'
import { getPostBySlug, loadPostBody, formatPostDate } from '../lib/posts'
import type { TocEntry } from '../lib/markdown'

const SITE_URL = 'https://www.muyideen.dev'

interface RenderedPost {
  html: string
  toc: TocEntry[]
}

/**
 * Fetch the post body and render it to HTML lazily, so the markdown body,
 * markdown-it and highlight.js all stay out of the initial bundle.
 */
function useRenderedBody(slug: string | undefined): RenderedPost | null {
  const [rendered, setRendered] = useState<RenderedPost | null>(null)

  useEffect(() => {
    if (slug === undefined) return
    let active = true
    setRendered(null)
    Promise.all([loadPostBody(slug), import('../lib/markdown')])
      .then(([body, { renderMarkdown, extractToc }]) => {
        if (active) setRendered({ html: renderMarkdown(body, slug), toc: extractToc(body) })
      })
      .catch(() => {
        if (active) setRendered({ html: '', toc: [] })
      })
    return () => {
      active = false
    }
  }, [slug])

  return rendered
}

/** "On this page" outline, shown when a post has enough sections to warrant one. */
function TableOfContents({ toc }: { toc: TocEntry[] }) {
  if (toc.length < 3) return null
  return (
    <nav aria-label="Table of contents" className="mt-8 rounded border bg-surface p-5">
      <p className="font-mono text-xs text-muted mb-3" aria-hidden="true">
        <span className="text-accent">$</span> grep &apos;^##&apos; post.md
      </p>
      <ul className="space-y-1.5">
        {toc.map(entry => (
          <li key={entry.slug} className={entry.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${entry.slug}`}
              className="font-mono text-sm text-muted hover:text-accent transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Add a copy-to-clipboard button to every rendered code block. */
function useCodeCopyButtons(ref: React.RefObject<HTMLElement>, html: string | null) {
  useEffect(() => {
    const root = ref.current
    if (!root || !html) return

    const buttons: HTMLButtonElement[] = []
    root.querySelectorAll<HTMLPreElement>('pre.hljs').forEach(pre => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy'
      button.textContent = 'copy'
      button.setAttribute('aria-label', 'Copy code to clipboard')
      button.addEventListener('click', () => {
        const code = pre.querySelector('code')?.textContent ?? ''
        navigator.clipboard.writeText(code).then(() => {
          button.textContent = 'copied'
          button.classList.add('code-copy--done')
          window.setTimeout(() => {
            button.textContent = 'copy'
            button.classList.remove('code-copy--done')
          }, 1600)
        })
      })
      pre.appendChild(button)
      buttons.push(button)
    })

    return () => buttons.forEach(button => button.remove())
  }, [ref, html])
}

function NotFound() {
  return (
    <>
      <Helmet>
        <title>Post not found — Muyideen Morenigbade</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-content mx-auto px-6 pt-32 pb-24">
        <p className="font-mono text-xs text-accent tracking-widest mb-2">
          $ cat post.md
        </p>
        <h1 className="font-mono text-2xl font-bold text-white">
          404 · post not found
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          That post does not exist, or it may still be a draft.
        </p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent/80 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to all posts
        </Link>
      </div>
    </>
  )
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined
  const rendered = useRenderedBody(post?.slug)
  const html = rendered?.html ?? null
  const proseRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  useCodeCopyButtons(proseRef, html)

  // Click any post image to view it full-screen (event delegation, so it
  // survives re-renders of the injected HTML).
  useEffect(() => {
    const root = proseRef.current
    if (!root || !html) return
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (target instanceof HTMLImageElement) {
        setLightbox({ src: target.currentSrc || target.src, alt: target.alt })
      }
    }
    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [html])

  if (!post) return <NotFound />

  const canonical = `${SITE_URL}/blog/${post.slug}`

  return (
    <>
      <Helmet>
        <title>{post.title} — Muyideen Morenigbade</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="article:published_time" content={post.date} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      </Helmet>

      <article className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            all posts
          </Link>

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted tabular-nums">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} aria-hidden="true" />
                {post.readingTime} min read
              </span>
            </div>

            <h1 className="mt-3 font-mono text-3xl sm:text-4xl font-bold leading-tight text-white text-balance">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="font-mono text-[11px] text-accent border border-accent/40 rounded px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="mt-8 h-px bg-[rgba(255,255,255,0.07)]" />
        </motion.div>

        {html === null ? (
          <p className="mt-10 font-mono text-sm text-muted" aria-live="polite">
            Rendering…
          </p>
        ) : (
          <>
            <TableOfContents toc={rendered?.toc ?? []} />
            <motion.div
              ref={proseRef}
              className="post-prose mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <Lightbox
              src={lightbox?.src ?? null}
              alt={lightbox?.alt ?? ''}
              onClose={() => setLightbox(null)}
            />
          </>
        )}
      </article>
    </>
  )
}
