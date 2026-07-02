import { motion } from 'framer-motion'
import { GraduationCap, Code2 } from 'lucide-react'
import type { EducationEntry } from '../data/portfolio'

function EducationCard({ entry, index }: { entry: EducationEntry; index: number }) {
  const Icon = entry.type === 'degree' ? GraduationCap : Code2

  const inner = (
    <div className="bg-surface border rounded overflow-hidden h-full flex flex-col hover:border-[rgba(255,255,255,0.18)] transition-colors">
      <div className="h-0.5 bg-accent w-full shrink-0" />
      <div className="p-6 sm:p-7 flex flex-col flex-1">
        <div className="w-14 h-14 rounded-xl bg-surface-2 flex items-center justify-center mb-6 shrink-0">
          <Icon size={24} className="text-accent" aria-hidden="true" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
          {entry.degree}
        </h3>
        <p className="text-muted mb-5 leading-relaxed">{entry.institution}</p>
        <div className="mt-auto">
          <span className="font-mono text-sm text-accent bg-surface-2 px-3 py-1.5 rounded-full">
            {entry.period}
          </span>
        </div>
      </div>
    </div>
  )

  if (entry.url) {
    return (
      <motion.a
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.07 }}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.07 }}
    >
      {inner}
    </motion.div>
  )
}

export function Education({ education }: { education: EducationEntry[] }) {
  return (
    <section id="education" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <p className="font-mono text-xs text-muted mb-1">$ cat education/</p>
          <h2 className="font-mono text-xl font-semibold">Education</h2>
          <div className="mt-4 h-px bg-[rgba(255,255,255,0.07)]" />
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {education.map((entry, i) => (
            <EducationCard key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
