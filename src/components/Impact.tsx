import { motion } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'
import type { ImpactOutcome } from '../data/portfolio'

/**
 * What the work changed, directly under the hero.
 *
 * Deliberately not a terminal window: this is the one block on the page that
 * should read as a plain statement of fact, and shell chrome would make it
 * look like output someone generated rather than work someone did.
 *
 * It used to lead with four percentages. Without them the outcome itself is
 * the headline and the tooling underneath is the evidence — which is the part
 * a technical reader can weigh. The measured figures are still on the page,
 * in the Experience bullets that produced them.
 */
export function Impact({ impact }: { impact: ImpactOutcome[] }) {
  return (
    <section
      id="impact"
      className="border-y border-[rgb(var(--border)/0.07)] bg-surface/40 px-6 py-16 sm:py-20"
      aria-labelledby="impact-heading"
    >
      <div className="mx-auto max-w-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
            Engineering impact
          </p>
          <h2 id="impact-heading" className="font-mono text-xl font-semibold">
            What the work changed
          </h2>
        </motion.div>

        <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {impact.map((item, i) => (
            <motion.div
              key={item.outcome}
              className="min-w-0 border-t border-accent/40 pt-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.07 }}
            >
              <dt className="font-mono text-base font-semibold leading-snug text-fg">
                {item.outcome}
              </dt>
              <dd className="mt-2.5 text-sm leading-relaxed text-muted">
                {item.detail}
              </dd>
            </motion.div>
          ))}
        </dl>

        <p className="mt-10 font-mono text-xs text-muted">
          {'# '}from roles at Perizer and Teknowledge — see Experience below
        </p>
      </div>
    </section>
  )
}
