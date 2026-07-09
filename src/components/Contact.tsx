import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Linkedin, Mail } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { EASE, VIEWPORT } from '../lib/motion'

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
      className="group inline-flex items-center gap-2.5 rounded border bg-surface-2 px-4 py-2.5 font-mono text-sm text-muted hover:text-white hover:border-[rgba(255,255,255,0.22)] transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <span className="text-accent" aria-hidden="true">$</span>
      <span aria-hidden="true">echo {email} | pbcopy</span>
      <span className="sr-only">Copy email address {email} to clipboard</span>
      {copied ? (
        <Check size={13} className="text-accent" aria-hidden="true" />
      ) : (
        <Copy size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      )}
      <span aria-live="polite" className="sr-only">{copied ? 'Email copied' : ''}</span>
    </button>
  )
}

interface ContactProps {
  email: string
  github: string
  linkedin: string
}

export function Contact({ email, github, linkedin }: ContactProps) {
  const links = [
    { label: 'Email', href: `mailto:${email}`, Icon: Mail },
    { label: 'GitHub', href: github, Icon: GitHubIcon },
    { label: 'LinkedIn', href: linkedin, Icon: Linkedin },
  ]

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
          className="bg-surface border rounded p-8 sm:p-10"
        >
          <p className="font-mono text-xs text-muted mb-2">$ contact --reach-out</p>
          <h2 className="font-mono text-xl font-semibold mb-2">Get in touch</h2>
          <p className="font-sans text-sm text-muted leading-relaxed mb-6 max-w-md">
            Open to DevOps and platform engineering roles. Reach out via
            email or connect on LinkedIn.
          </p>

          <CopyEmail email={email} />

          <div className="flex flex-wrap gap-3">
            {links.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded border font-mono text-sm text-muted hover:text-white hover:border-[rgba(255,255,255,0.22)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <Icon size={13} aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
