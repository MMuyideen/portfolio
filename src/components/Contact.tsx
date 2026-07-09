import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Download, Linkedin, Mail } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { EASE, VIEWPORT } from '../lib/motion'

interface ContactProps {
  email: string
  github: string
  linkedin: string
}

/**
 * mailto: dead-ends on machines without a configured mail client, so the
 * primary affordance copies the address; the mailto button stays as backup.
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
      className="group inline-flex max-w-full items-center gap-2.5 rounded border bg-surface-2 px-4 py-2.5 font-mono text-sm text-muted hover:text-white hover:border-[rgba(255,255,255,0.22)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <span className="text-accent" aria-hidden="true">$</span>
      <span className="truncate" aria-hidden="true">echo {email} | pbcopy</span>
      <span className="sr-only">Copy email address {email} to clipboard</span>
      {copied ? (
        <Check size={13} className="shrink-0 text-accent" aria-hidden="true" />
      ) : (
        <Copy size={13} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      )}
      <span aria-live="polite" className="sr-only">{copied ? 'Email copied' : ''}</span>
    </button>
  )
}

const GHOST_BUTTON =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border font-mono text-sm text-muted hover:text-white hover:border-[rgba(255,255,255,0.22)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export function Contact({ email, github, linkedin }: ContactProps) {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        {/* The closing terminal session — same window chrome as the hero cards. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          className="overflow-hidden rounded-lg border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] px-4 py-3">
            <div className="flex gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
              <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
              <span className="h-3 w-3 rounded-full bg-[#3a4150]" />
            </div>
            <span className="ml-2 font-mono text-sm text-muted">
              ~/muyideen · contact
            </span>
            <span className="ml-auto inline-flex items-center gap-2 font-mono text-sm text-accent">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
              </span>
              open to work
            </span>
          </div>

          {/* Body */}
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <p className="font-mono text-xs text-muted mb-2" aria-hidden="true">
                <span className="text-accent">$</span> contact --reach-out
              </p>
              <h2 className="font-mono text-2xl sm:text-3xl font-semibold mb-3">
                Get in touch
              </h2>
              <p className="font-sans text-sm text-muted leading-relaxed mb-6 max-w-md">
                Open to DevOps and platform engineering roles. Email is the
                fastest way to reach me — or connect on LinkedIn.
              </p>
              <CopyEmail email={email} />
            </div>

            {/* Actions: one primary, the rest quiet. */}
            <div className="flex flex-col gap-3 lg:w-56">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-mono text-sm font-semibold bg-accent text-bg hover:bg-accent/90 hover:shadow-[0_0_28px_rgba(74,222,128,0.28)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Mail size={14} aria-hidden="true" />
                Email me
              </a>
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={GHOST_BUTTON}
              >
                <Linkedin size={13} aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={GHOST_BUTTON}
              >
                <GitHubIcon size={13} aria-hidden="true" />
                GitHub
              </a>
              <a href="/resume.pdf" download className={GHOST_BUTTON}>
                <Download size={13} aria-hidden="true" />
                Resume
              </a>
            </div>
          </div>

          {/* Session sign-off */}
          <div className="border-t border-[rgba(255,255,255,0.07)] px-8 sm:px-10 py-3 font-mono text-xs text-muted select-none" aria-hidden="true">
            <span className="text-accent">$</span> exit 0{' '}
            <span className="opacity-60"># thanks for scrolling this far</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
