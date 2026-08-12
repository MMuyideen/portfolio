import { motion } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'
import type { ImpactMetric } from '../data/portfolio'

/**
 * Measured results, directly under the hero.
 *
 * Deliberately not a terminal window: this is the one block on the page that
 * should read as a plain statement of fact, and shell chrome would make it
 * look like output someone generated rather than work someone did. Every
 * figure is the same number as the matching bullet in Experience.
 */
export function Impact({ impact }: { impact: ImpactMetric[] }) {
  return (
    <section
      id="impact"
      className="px-6 py-16 sm:py-20 border-y border-[rgba(255,255,255,0.07)] bg-surface/40"
      aria-labelledby="impact-heading"
    >
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="font-mono text-xs text-accent tracking-widest uppercase mb-2">
            Engineering impact
          </p>
          <h2 id="impact-heading" className="font-mono text-xl font-semibold">
            What the work changed
          </h2>
        </motion.div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
          {impact.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="min-w-0"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.07 }}
            >
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <span className="block font-mono text-4xl sm:text-5xl font-bold tabular-nums leading-none tracking-tight text-accent">
                  {metric.value}
                </span>
                {/* Hairline under each figure, echoing the section rules. */}
                <span
                  className="mt-4 block h-px w-8 bg-accent/40"
                  aria-hidden="true"
                />
                <span className="mt-4 block text-sm leading-snug text-muted">
                  {metric.label}
                </span>
              </dd>
            </motion.div>
          ))}
        </dl>

        <p className="mt-10 font-mono text-xs text-muted">
          {'# '}measured in role at Perizer and Teknowledge — see Experience below
        </p>
      </div>
    </section>
  )
}
