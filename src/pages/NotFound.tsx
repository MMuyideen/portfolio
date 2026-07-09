import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Catch-all 404 for unknown routes. */
export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Muyideen Morenigbade</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-content mx-auto px-6 pt-32 pb-24">
        <p className="font-mono text-xs text-accent tracking-widest mb-2" aria-hidden="true">
          $ cd {typeof window !== 'undefined' ? window.location.pathname : '/'}
        </p>
        <h1 className="font-mono text-2xl font-bold text-white">
          404 · no such file or directory
        </h1>
        <p className="mt-3 text-muted leading-relaxed max-w-md">
          That path doesn&apos;t exist. It may have moved, or the link is wrong.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent/80 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          cd ~
        </Link>
      </div>
    </>
  )
}
