import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/** Sample value used until /api/visitors returns a real count. */
const SAMPLE_COUNT = 0
/** Serverless endpoint backing the counter (Azure Table Storage). */
const VISITORS_ENDPOINT = '/api/visitors'

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Fetch the shared server-side count, falling back to the sample value. */
function useVisitorCount(): number {
  const [count, setCount] = useState(SAMPLE_COUNT)

  useEffect(() => {
    let active = true
    fetch(VISITORS_ENDPOINT, { headers: { accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { count?: number }) => {
        if (active && typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {
        /* keep the sample value */
      })
    return () => {
      active = false
    }
  }, [])

  return count
}

/** Animate 0 → target once the element scrolls into view. */
function useCountUp(target: number, active: boolean): number {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) {
      setDisplay(target)
      return
    }

    const duration = 1600
    let raf = 0
    let start = 0

    const step = (now: number) => {
      if (!start) start = now
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4) // ease-out-quart
      setDisplay(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, active])

  return display
}

export function VisitorCount() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const target = useVisitorCount()
  const display = useCountUp(target, inView)

  return (
    <motion.div
      id="visitors"
      ref={ref}
      className="flex h-full flex-col overflow-hidden rounded-lg border bg-surface"
      aria-label="Visitor count"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
        </div>
        <span className="ml-2 font-mono text-sm text-muted">
          ~/muyideen · 
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-5 font-mono text-sm sm:text-base">
          <span className="text-accent">$</span>{' '}
          <span className="font-semibold text-white">cat</span>{' '}
          <span className="text-muted">visitors.count</span>
        </p>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-5xl sm:text-6xl font-bold tabular-nums leading-none text-accent">
            {display.toLocaleString('en-US')}
          </span>
          <span className="font-mono text-sm text-muted">
            total visits since launch
          </span>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          served by {VISITORS_ENDPOINT} · azure table storage
        </p>

        {/* <p className="mt-auto pt-5 text-sm leading-relaxed text-muted">
          The number is stored server-side and shared across everyone, so it
          survives reloads. This preview just animates to a sample value.
        </p> */}
      </div>
    </motion.div>
  )
}
