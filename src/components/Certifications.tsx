import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import type { Certification } from '../data/portfolio'

function getCredlyImage(verifyUrl: string): string | null {
  const m = verifyUrl.match(/credly\.com\/badges\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/)
  return m ? `https://images.credly.com/badges/${m[1]}/original.png` : null
}

/** Format "2026-01" as "Jan 2026"; unrecognised values pass through. */
function formatCertDate(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})$/)
  if (!match) return date
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleDateString(
    'en-GB',
    { month: 'short', year: 'numeric', timeZone: 'UTC' },
  )
}

function issuerAbbrev(issuer: string): string {
  const words = issuer.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
}

function BadgeImage({ cert }: { cert: Certification }) {
  const [errored, setErrored] = useState(false)
  const src = cert.badgeImage ?? getCredlyImage(cert.verifyUrl)

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={cert.title}
        width={96}
        height={96}
        className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
        loading="lazy"
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <div
      className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-surface-2 border flex items-center justify-center font-mono text-xl font-semibold text-accent select-none"
      aria-hidden="true"
    >
      {issuerAbbrev(cert.issuer)}
    </div>
  )
}

export function Certifications({ certifications }: { certifications: Certification[] }) {
  return (
    <section id="certifications" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="ls -la certs/" title="Certifications" />

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {certifications.map((cert, i) => (
            <motion.a
              key={i}
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.06 }}
              whileHover={{ y: -4 }}
              className="group bg-surface border rounded p-4 flex flex-col items-center gap-3 hover:border-[rgba(255,255,255,0.18)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`${cert.title} — verify credential`}
            >
              <BadgeImage cert={cert} />

              <div className="w-full text-center space-y-0.5">
                <p className="font-mono text-xs leading-snug line-clamp-3">
                  {cert.title}
                </p>
                <p className="font-mono text-[10px] text-muted truncate">
                  {cert.issuer}
                </p>
              </div>

              <div className="w-full flex items-center justify-between font-mono text-[10px] text-muted mt-auto pt-2 border-t">
                <span className="tabular-nums">{formatCertDate(cert.date)}</span>
                <span className="flex items-center gap-0.5 text-accent group-hover:underline">
                  verified
                  <ExternalLink size={9} aria-hidden="true" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
