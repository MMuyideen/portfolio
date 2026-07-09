import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { EASE, VIEWPORT } from '../lib/motion'

/** Site launch date — set this to your real go-live date (must be in the past, UTC). */
const LAUNCH = new Date('2026-07-03T00:00:00+01:00')
const UPTIME_PERCENT = '100'

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

function useUptime(): Elapsed {
  const [elapsed, setElapsed] = useState<Elapsed>(() =>
    elapsedSince(LAUNCH, Date.now()),
  )

  useEffect(() => {
    const tick = () => setElapsed(elapsedSince(LAUNCH, Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return elapsed
}

interface Stat {
  value: string
  label: string
  accent?: boolean
  highlight?: boolean
}

function StatCell({ stat, index }: { stat: Stat; index: number }) {
  return (
    <motion.div
      className={
        'flex flex-col items-center justify-center rounded bg-surface-2 px-2 py-4 sm:py-5 ' +
        (stat.highlight
          ? 'border border-accent/60'
          : 'border border-[rgba(255,255,255,0.06)]')
      }
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.15 + index * 0.06 }}
    >
      <span
        className={
          'font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none ' +
          (stat.accent || stat.highlight ? 'text-accent' : 'text-white')
        }
      >
        {stat.value}
      </span>
      <span className="mt-3 font-mono text-xs text-muted">{stat.label}</span>
    </motion.div>
  )
}

export function Uptime() {
  const { years, days, hours, minutes, seconds } = useUptime()
  const launchLabel = LAUNCH.toISOString().slice(0, 10)

  const stats: Stat[] = [
    { value: String(years), label: 'years', accent: years === 0 },
    { value: String(days), label: 'days', accent: years === 0 && days === 0 },
    { value: String(hours), label: 'hours' },
    { value: String(minutes), label: 'minutes' },
    { value: String(seconds), label: 'seconds' },
    { value: UPTIME_PERCENT, label: '% uptime', highlight: true },
  ]

  return (
    <motion.div
      id="uptime"
      className="flex h-full flex-col overflow-hidden rounded-lg border bg-surface"
      aria-label="Site uptime"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
          <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
        </div>
        <span className="ml-2 font-mono text-sm text-muted">
          ~/muyideen · uptime
        </span>
        <span className="ml-auto inline-flex items-center gap-2 font-mono text-sm text-accent">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          online
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-5 font-mono text-sm sm:text-base">
          <span className="text-accent">$</span>{' '}
          <span className="font-semibold text-white">uptime</span>{' '}
          <span className="text-muted">-- since {launchLabel}</span>
        </p>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <StatCell key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* <p className="mt-auto pt-5 text-sm leading-relaxed text-muted">
          Live since launch, counted from years down to the second. Set your real
          launch date in the{' '}
          <code className="font-mono text-white">LAUNCH</code> constant.
        </p> */}
      </div>
    </motion.div>
  )
}
