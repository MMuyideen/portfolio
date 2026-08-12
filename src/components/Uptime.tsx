import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'
import { LAUNCH, LAUNCH_DATE } from '../lib/site'

interface Elapsed {
  years: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

function elapsedSince(from: Date, now: number): Elapsed {
  const diff = Math.max(0, now - from.getTime())
  const totalDays = Math.floor(diff / DAY)
  const years = Math.floor(totalDays / 365)
  const days = totalDays - years * 365
  const hours = Math.floor((diff % DAY) / HOUR)
  const minutes = Math.floor((diff % HOUR) / MIN)
  const seconds = Math.floor((diff % MIN) / SEC)
  return { years, days, hours, minutes, seconds }
}

/** Ticks once per second, but only while the card is actually on screen. */
function useUptime(active: boolean): Elapsed {
  const [elapsed, setElapsed] = useState<Elapsed>(() =>
    elapsedSince(LAUNCH, Date.now()),
  )

  useEffect(() => {
    if (!active) return
    const tick = () => setElapsed(elapsedSince(LAUNCH, Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [active])

  return elapsed
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Time since this deployment went live, counted from the shared launch date.
 *
 * The previous version also printed "100% uptime", which was a hardcoded
 * string with nothing measuring it — the one unverifiable number on a page
 * whose argument is that the numbers are verifiable. Elapsed time is a fact
 * about the deployment, so that is all this claims.
 */
export function Uptime() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const { years, days, hours, minutes, seconds } = useUptime(inView)

  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  const span = years > 0 ? `${years}y ${days}d` : `${days}d`

  return (
    <motion.div
      id="uptime"
      ref={ref}
      className="flex h-full flex-col rounded-lg border bg-surface p-5 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        Live
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
      </p>

      <p className="mt-4 flex flex-wrap items-baseline gap-x-3 font-mono leading-none">
        <span className="text-4xl font-bold tabular-nums text-accent sm:text-5xl">
          {span}
        </span>
        <span className="text-lg tabular-nums text-muted">{clock}</span>
      </p>

      <p className="mt-3 text-sm text-muted">
        since the first deploy
      </p>

      <p className="mt-auto pt-5 font-mono text-[11px] text-muted">
        Azure Static Web Apps · since {LAUNCH_DATE}
      </p>
    </motion.div>
  )
}
