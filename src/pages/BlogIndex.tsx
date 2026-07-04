import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { getAllPosts, formatPostDate } from '../lib/posts'

const SITE_URL = 'https://www.muyideen.dev'

export function BlogIndex() {
  const posts = getAllPosts()

  return (
    <>
      <Helmet>
        <title>Blog — Muyideen Morenigbade</title>
        <meta
          name="description"
          content="Field notes on Azure, Terraform, OpenShift and CI/CD from building and running cloud platforms."
        />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog — Muyideen Morenigbade" />
        <meta
          property="og:description"
          content="Field notes on Azure, Terraform, OpenShift and CI/CD from building and running cloud platforms."
        />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-content mx-auto px-6 pt-28 pb-24">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs text-accent tracking-widest mb-2">
            $ ls -la posts/
          </p>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold text-white">
            Blog
          </h1>
          <p className="mt-3 max-w-xl text-muted leading-relaxed">
            Field notes on cloud platforms, infrastructure as code and delivery
            pipelines. Mostly Azure, Terraform and OpenShift, written down while
            they are still fresh.
          </p>
          <div className="mt-6 h-px bg-[rgba(255,255,255,0.07)]" />
        </motion.header>

        {posts.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-muted">
            No posts published yet. Check back soon.
          </p>
        ) : (
          <ul className="mt-4">
            {posts.map((post, i) => (
              <motion.li
                key={post.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 + i * 0.05 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group grid grid-cols-1 gap-2 border-b py-6 sm:grid-cols-[8rem_1fr] sm:gap-6 sm:items-baseline focus-visible:outline-none focus-visible:bg-surface/60 rounded-sm"
                >
                  <time
                    dateTime={post.date}
                    className="font-mono text-xs text-muted tabular-nums pt-0.5"
                  >
                    {formatPostDate(post.date)}
                  </time>

                  <div>
                    <h2 className="flex items-start gap-1.5 font-mono text-lg font-semibold leading-snug text-white transition-colors group-hover:text-accent">
                      {post.title}
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-muted transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted tabular-nums">
                        <Clock size={11} aria-hidden="true" />
                        {post.readingTime} min read
                      </span>
                      <span className="text-[rgba(255,255,255,0.15)]" aria-hidden="true">
                        |
                      </span>
                      <span className="flex flex-wrap gap-1.5">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] text-muted border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
