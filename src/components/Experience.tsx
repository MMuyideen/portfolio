import { motion } from 'framer-motion'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import type { ExperienceEntry } from '../data/portfolio'

export function Experience({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="git log --oneline" title="Experience" />

        <div className="mt-10 space-y-10">
          {experience.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
              className="flex gap-4"
            >
              {/* Commit glyph + connector */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <motion.span
                  className="text-accent text-base leading-none"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 + 0.1 }}
                >
                  ●
                </motion.span>
                {i < experience.length - 1 && (
                  <motion.div
                    className="mt-2 w-px flex-1 bg-[rgba(255,255,255,0.07)] origin-top"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 + 0.2 }}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-sm">
                  <h3 className="font-semibold">{entry.role}</h3>
                  <span className="text-muted">{entry.company}</span>
                  <span className="text-muted text-xs tabular-nums ml-auto">{entry.period}</span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {entry.bullets.map((bullet, j) => (
                    <li key={j} className="flex gap-2.5 font-sans text-sm text-muted leading-relaxed">
                      <span className="text-accent/50 shrink-0 mt-0.5 font-mono" aria-hidden="true">
                        #
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
