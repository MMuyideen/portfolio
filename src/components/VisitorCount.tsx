import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'
import { LAUNCH_LABEL } from '../lib/site'

/** Serverless endpoint backing the counter (Azure Table Storage). */
const VISITORS_ENDPOINT = '/api/visitors'

type CountState =
  | { status: 'loading' }
  | { status: 'ready'; count: number }
  | { status: 'unavailable' }

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Fetch the shared server-side count.
 *
 * Failure is a normal outcome, not an error: the counter is a detail, and a
 * cold Function or a blocked request must never take the section with it.
 */
function useVisitorCount(): CountState {
  const [state, setState] = useState<CountState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    fetch(VISITORS_ENDPOINT, { headers: { accept: 'application/json' } })
      .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { count?: number }) => {
        if (!active) return
        setState(
          typeof data.count === 'number'
            ? { status: 'ready', count: data.count }
            : { status: 'unavailable' },
        )
      })
      .catch(() => {
        if (active) setState({ status: 'unavailable' })
      })
    return () => {
      active = false
    }
  }, [])

  return state
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

/**
 * The visitor count, stated rather than performed.
 *
 * It used to be a full terminal window in the hero running `cat visitors.count`
 * — the loudest element on the page for the least important number. Same
 * endpoint, same animation, a quarter of the volume, and now sitting beside the
 * architecture it is evidence for.
 */
export function VisitorCount() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const state = useVisitorCount()
  const ready = state.status === 'ready'
  const display = useCountUp(ready ? state.count : 0, inView && ready)

  return (
    <motion.div
      id="visitors"
      ref={ref}
      className="flex h-full flex-col rounded-lg border bg-surface p-5 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
        Visitors
      </p>

      {/* Fixed line-height on a reserved row: the number arrives from a fetch,
          and the layout must not move when it does. */}
      <p
        className="mt-4 font-mono text-4xl font-bold leading-none tabular-nums text-accent sm:text-5xl"
        aria-busy={state.status === 'loading'}
      >
        {ready ? (
          display.toLocaleString('en-US')
        ) : (
          <span className="text-muted" aria-hidden="true">—</span>
        )}
        <span className="sr-only">
          {ready
            ? `${state.count.toLocaleString('en-US')} visits since ${LAUNCH_LABEL}`
            : state.status === 'loading'
              ? 'Loading visitor count'
              : 'Visitor count unavailable'}
        </span>
      </p>

      <p className="mt-3 text-sm text-muted">
        {state.status === 'unavailable'
          ? 'count unavailable'
          : `since ${LAUNCH_LABEL}`}
      </p>

      <p className="mt-auto pt-5 font-mono text-[11px] text-muted">
        Azure Table Storage
      </p>
    </motion.div>
  )
}
