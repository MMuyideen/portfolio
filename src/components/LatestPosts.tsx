import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import { getAllPosts, formatPostDate } from '../lib/posts'

/** Home-page preview: the three newest non-draft posts as cards. */
export function LatestPosts() {
  const posts = getAllPosts().slice(0, 3)
  if (posts.length === 0) return null

  return (
    <section id="blog" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          className="flex items-end justify-between gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div>
            <p className="font-mono text-xs text-accent tracking-widest mb-1">
              {'// '}latest posts
            </p>
            <h2 className="font-mono text-xl font-semibold">From the blog</h2>
          </div>
          <Link
            to="/blog"
            className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent transition-colors rounded-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            view all posts
            <ArrowRight
              size={13}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>

        <div className="mt-4 h-px bg-[rgba(255,255,255,0.07)]" />

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post, i) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.06 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-lg border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-center gap-3 font-mono text-[11px] text-muted tabular-nums">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} aria-hidden="true" />
                    {post.readingTime} min
                  </span>
                </div>

                <h3 className="mt-3 font-mono text-base font-semibold leading-snug text-white transition-colors group-hover:text-accent">
                  {post.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] text-muted border border-[rgba(255,255,255,0.12)] rounded px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-accent">
                  read
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
