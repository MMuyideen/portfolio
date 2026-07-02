import { motion } from 'framer-motion'
import type { ExperienceEntry } from '../data/portfolio'

export function Experience({ experience }: { experience: ExperienceEntry[] }) {
  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs text-muted mb-1">$ git log --oneline</p>
          <h2 className="font-mono text-xl font-semibold">Experience</h2>
          <div className="mt-4 h-px bg-[rgba(255,255,255,0.07)]" />
        </motion.div>

        <div className="mt-10 space-y-10">
          {experience.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.06 }}
              className="flex gap-4"
            >
              {/* Commit glyph + connector */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <span className="text-accent text-base leading-none">●</span>
                {i < experience.length - 1 && (
                  <div className="mt-2 w-px flex-1 bg-[rgba(255,255,255,0.07)]" />
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
