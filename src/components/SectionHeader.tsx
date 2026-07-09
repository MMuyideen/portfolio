import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { EASE } from '../lib/motion'

interface SectionHeaderProps {
  /** Shell command shown in the kicker, without the leading `$`. */
  command: string
  title: string
}

/**
 * Shared section header: a `$ command` kicker that types itself the first
 * time it scrolls into view, the mono heading, and a hairline divider that
 * grows from the left. The kicker is decorative shell flavor (aria-hidden);
 * the h2 carries the semantics and is never gated behind the typing.
 */
export function SectionHeader({ command, title }: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()
  const [chars, setChars] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setChars(command.length)
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setChars(i)
      if (i >= command.length) window.clearInterval(id)
    }, 24)
    return () => window.clearInterval(id)
  }, [inView, reduced, command])

  const typing = inView && chars < command.length

  return (
    <div ref={ref}>
      <p className="font-mono text-xs text-muted mb-1 h-4" aria-hidden="true">
        <span className="text-accent">$</span> {command.slice(0, chars)}
        {typing && (
          <span className="inline-block w-[0.5ch] h-[1em] bg-muted/60 align-text-bottom ml-px" />
        )}
      </p>
      <motion.h2
        className="font-mono text-xl font-semibold"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      <motion.div
        className="mt-4 h-px bg-[rgba(255,255,255,0.07)] origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        aria-hidden="true"
      />
    </div>
  )
}
