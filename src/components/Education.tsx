import { motion } from 'framer-motion'
import { GraduationCap, Code2, ArrowUpRight } from 'lucide-react'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT, SPRING } from '../lib/motion'
import type { EducationEntry } from '../data/portfolio'

function EducationRow({ entry, index }: { entry: EducationEntry; index: number }) {
  const Icon = entry.type === 'degree' ? GraduationCap : Code2

  const inner = (
    <>
      <Icon size={16} className="text-accent shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="font-mono text-base font-semibold text-fg leading-snug">
          {entry.degree}
        </h3>
        <p className="mt-0.5 text-sm text-muted">{entry.institution}</p>
      </div>
      <span className="font-mono text-xs text-muted tabular-nums shrink-0">
        {entry.period}
      </span>
      {entry.url && (
        <ArrowUpRight
          size={14}
          aria-hidden="true"
          className="shrink-0 text-muted transition-all group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </>
  )

  const rowClass =
    'flex items-center gap-4 px-6 sm:px-8 py-5 ' +
    (index > 0 ? 'border-t border-[rgb(var(--border)/0.06)] ' : '')

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, ease: EASE, delay: index * 0.08 }}
    >
      {entry.url ? (
        <motion.a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ x: 3, transition: SPRING }}
          className={
            rowClass +
            'group hover:bg-surface-2/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset'
          }
        >
          {inner}
        </motion.a>
      ) : (
        <div className={rowClass}>{inner}</div>
      )}
    </motion.li>
  )
}

export function Education({ education }: { education: EducationEntry[] }) {
  return (
    <section id="education" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="cat education/" title="Education" />

        <ul className="mt-10 rounded-lg border bg-surface shadow-[inset_0_1px_0_rgb(var(--border)/0.04)]">
          {education.map((entry, i) => (
            <EducationRow key={entry.degree} entry={entry} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
