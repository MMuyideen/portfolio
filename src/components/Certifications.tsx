import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import {
  additionalCertifications,
  featuredCertifications,
  type Certification,
} from '../data/portfolio'

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

function BadgeImage({ cert, size }: { cert: Certification; size: 'lg' | 'sm' }) {
  const [errored, setErrored] = useState(false)
  const src = cert.badgeImage ?? getCredlyImage(cert.verifyUrl)
  const box = size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-11 w-11'

  if (src && !errored) {
    return (
      <img
        src={src}
        alt=""
        width={96}
        height={96}
        className={`${box} shrink-0 object-contain`}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <div
      className={`${box} flex shrink-0 items-center justify-center rounded border bg-surface-2 font-mono font-semibold text-accent select-none ${
        size === 'lg' ? 'text-xl' : 'text-xs'
      }`}
      aria-hidden="true"
    >
      {issuerAbbrev(cert.issuer)}
    </div>
  )
}

/**
 * Two weights. The expert-level and current credentials get badge-forward
 * cards; the foundational ones sit in a disclosure below, present for anyone
 * checking but not competing with AZ-305 for attention.
 */
export function Certifications() {
  const featured = featuredCertifications()
  const additional = additionalCertifications()
  const [showAll, setShowAll] = useState(false)

  return (
    <section id="certifications" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionHeader command="verify --issuer" title="Certifications" />

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {featured.map((cert, i) => (
            <motion.li
              key={cert.verifyUrl + cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: (i % 5) * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center gap-3 rounded border bg-surface p-4 transition-colors hover:border-[rgb(var(--border)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`${cert.title} — verify credential`}
              >
                <BadgeImage cert={cert} size="lg" />

                <div className="w-full space-y-0.5 text-center">
                  <p className="font-mono text-xs leading-snug text-fg">
                    {cert.shortTitle ?? cert.title}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted">
                    {cert.issuer}
                  </p>
                </div>

                <div className="mt-auto flex w-full items-center justify-between border-t pt-2 font-mono text-[10px] text-muted">
                  <span className="tabular-nums">{formatCertDate(cert.date)}</span>
                  <span className="flex items-center gap-0.5 text-accent group-hover:underline">
                    verify
                    <ExternalLink size={9} aria-hidden="true" />
                  </span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        {additional.length > 0 && (
          <div className="mt-8">
            <button
              type="button"
              aria-expanded={showAll}
              aria-controls="additional-certs"
              onClick={() => setShowAll(prev => !prev)}
              className="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-[rgb(var(--border)/0.2)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {showAll ? (
                <ChevronUp size={13} aria-hidden="true" />
              ) : (
                <ChevronDown size={13} aria-hidden="true" />
              )}
              Additional certifications
              <span className="text-accent">{additional.length}</span>
            </button>

            {/* Kept in the DOM and hidden with an attribute rather than sliced
                out, so the prerendered HTML carries every credential. */}
            <ul
              id="additional-certs"
              hidden={!showAll}
              className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {additional.map(cert => (
                <li key={cert.verifyUrl + cert.title}>
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full items-center gap-3 rounded border bg-surface px-4 py-3 transition-colors hover:border-[rgb(var(--border)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`${cert.title} — verify credential`}
                  >
                    <BadgeImage cert={cert} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs leading-snug text-fg">
                        {cert.shortTitle ?? cert.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-muted">
                        {cert.issuer} · {formatCertDate(cert.date)}
                      </span>
                    </span>
                    <ExternalLink
                      size={12}
                      aria-hidden="true"
                      className="shrink-0 text-muted transition-colors group-hover:text-accent"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
