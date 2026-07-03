import { motion } from 'framer-motion'
import { Linkedin, Mail } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'

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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-surface border rounded p-8 sm:p-10"
        >
          <p className="font-mono text-xs text-muted mb-2">$ contact --reach-out</p>
          <h2 className="font-mono text-xl font-semibold mb-2">Get in touch</h2>
          <p className="font-sans text-sm text-muted leading-relaxed mb-8 max-w-md">
            Open to DevOps and platform engineering roles. Reach out via
            email or connect on LinkedIn.
          </p>

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
