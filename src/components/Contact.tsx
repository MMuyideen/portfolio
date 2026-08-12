import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, Linkedin, Mail } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { RESUME_FILENAME } from '../lib/resume'
import { EASE, VIEWPORT } from '../lib/motion'

interface ContactProps {
  email: string
  github: string
  linkedin: string
}

/**
 * mailto: dead-ends on machines without a configured mail client, so the
 * address is also copyable. This is the fallback, not a second CTA — it sits
 * under the primary button at a quieter weight.
 */
function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(email).then(() => setCopied(true))}
      className="group inline-flex max-w-full items-center gap-2.5 rounded border bg-surface-2 px-4 py-2.5 font-mono text-sm text-muted transition-colors hover:border-[rgba(255,255,255,0.22)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <span className="truncate" aria-hidden="true">{email}</span>
      <span className="sr-only">Copy email address {email} to clipboard</span>
      {copied ? (
        <Check size={13} className="shrink-0 text-accent" aria-hidden="true" />
      ) : (
        <Copy
          size={13}
          className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      <span aria-live="polite" className="sr-only">{copied ? 'Email copied' : ''}</span>
    </button>
  )
}

const QUIET_LINK =
  'inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-white rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

/**
 * One thing to do, then the ways to check him out first.
 *
 * The previous version offered five buttons of near-equal weight, so none of
 * them read as the next step. Now: one filled button, the address beside it,
 * and the profiles as plain links.
 */
export function Contact({ email, github, linkedin }: ContactProps) {
  return (
    <section id="contact" className="px-6 py-24" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          className="overflow-hidden rounded-lg border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          {/* The one terminal window left on the page — the closing session. */}
          <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-6 py-3 sm:px-8">
            <span className="font-mono text-xs text-muted">
              ~/muyideen · contact
            </span>
            <span className="ml-auto inline-flex items-center gap-2 font-mono text-xs text-accent">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              open to work
            </span>
          </div>

          <div className="p-8 sm:p-10">
            <h2
              id="contact-heading"
              className="max-w-[20ch] text-2xl font-bold leading-tight text-white sm:text-3xl"
            >
              Let’s build reliable infrastructure.
            </h2>
            <p className="mt-4 max-w-[56ch] leading-relaxed text-muted">
              Open to Cloud, DevOps and Platform Engineering roles. Email is the
              fastest way to reach me.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-bg transition duration-200 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Mail size={14} aria-hidden="true" />
                Get in touch
              </a>
              <CopyEmail email={email} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[rgba(255,255,255,0.07)] pt-6">
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={QUIET_LINK}
              >
                <GitHubIcon size={14} aria-hidden="true" />
                GitHub
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={QUIET_LINK}
              >
                <Linkedin size={14} aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href="/resume.pdf"
                download={RESUME_FILENAME}
                className={QUIET_LINK}
              >
                <Download size={14} aria-hidden="true" />
                Résumé
              </a>
            </div>
          </div>

          {/* Session sign-off */}
          <div
            className="select-none border-t border-[rgba(255,255,255,0.07)] px-6 py-3 font-mono text-xs text-muted sm:px-8"
            aria-hidden="true"
          >
            <span className="text-accent">$</span> exit 0{' '}
            <span className="opacity-60"># thanks for scrolling this far</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
