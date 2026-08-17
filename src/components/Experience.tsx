import { motion } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import type { ExperienceEntry } from '../data/portfolio'

/**
 * The career as a commit log.
 *
 * Kept the timeline, added the two things that make a role scannable: the
 * company at heading weight rather than as an aside, and the technologies it
 * used pulled out from under the bullets so the shape of the role reads
 * without them.
 */
export function Experience({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section id="experience" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionHeader command="git log --oneline" title="Experience" />

        <div className="mt-12 space-y-12">
          {experience.map((entry, i) => (
            <motion.article
              key={`${entry.company}-${entry.period}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
              className="flex gap-4"
            >
              {/* Commit glyph + connector */}
              <div className="flex shrink-0 flex-col items-center pt-1.5">
                <motion.span
                  className="block h-2.5 w-2.5 rounded-full bg-accent"
                  aria-hidden="true"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 + 0.1 }}
                />
                {i < experience.length - 1 && (
                  <motion.div
                    className="mt-2 w-px flex-1 origin-top bg-[rgb(var(--border)/0.09)]"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 + 0.2 }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-mono text-base font-semibold text-fg">
                    {entry.role}
                  </h3>
                  <span className="font-mono text-sm text-accent">
                    {entry.company}
                  </span>
                  <span className="ml-auto font-mono text-xs tabular-nums text-muted">
                    {entry.period}
                  </span>
                </div>

                <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">
                  Key impact
                </p>
                <ul className="mt-2.5 space-y-2">
                  {entry.bullets.map(bullet => (
                    <li
                      key={bullet}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span
                        className="mt-0.5 shrink-0 font-mono text-accent/70"
                        aria-hidden="true"
                      >
                        #
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {entry.tech.length > 0 && (
                  <p className="mt-5 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
                    {entry.tech.map((tool, j) => (
                      <span key={tool}>
                        {tool}
                        {j < entry.tech.length - 1 && (
                          <span className="ml-2 text-muted" aria-hidden="true">·</span>
                        )}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
