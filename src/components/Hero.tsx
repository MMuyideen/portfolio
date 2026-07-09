import { motion } from 'framer-motion'
import { Linkedin, Download } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { useTerminalSequence, type TerminalStep } from '../hooks/useTerminalSequence'
import { EASE } from '../lib/motion'
import { portfolio } from '../data/portfolio'
import { Uptime } from './Uptime'
import { VisitorCount } from './VisitorCount'

const STEPS: readonly TerminalStep[] = [
  { kind: 'output', text: '> Hello, World! I am' },
]

export function Hero() {
  const { currentText, currentKind, idle } = useTerminalSequence(STEPS)

  const promptText = idle ? '> Hello, World! I am' : currentText
  const showCursor = !idle && currentKind === 'output'

  return (
    <section
      id="hero"
      className="flex flex-col gap-12 px-6 pt-28 pb-20"
    >
      <div className="w-full max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left: text content */}
        <div>
          {/* Typed prompt */}
          <p
            className="font-mono text-accent text-sm mb-5 h-5"
            role="log"
            aria-live="polite"
            aria-label="Terminal greeting"
          >
            {promptText}
            {showCursor && (
              <span
                className="inline-block w-[0.5ch] h-[1em] bg-accent align-text-bottom ml-px animate-blink"
                aria-hidden="true"
              />
            )}
          </p>

          {/* Name */}
          <motion.h1
            className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55, ease: EASE }}
          >
            {portfolio.name.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </motion.h1>

          {/* Bio */}
          <motion.p
            className="text-muted leading-relaxed mb-8 max-w-[52ch]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5, ease: EASE }}
          >
            {portfolio.role} building production-grade cloud infrastructure on
            AWS, Azure, and GCP. Specialising in Kubernetes, GitOps, and Terraform IaC
            to deliver high-availability systems with zero-downtime releases.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5, ease: EASE }}
          >
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-semibold bg-accent text-bg hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Download size={14} aria-hidden="true" />
              Download Resume
            </a>
            <a
              href={portfolio.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm text-muted border hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <GitHubIcon size={14} aria-hidden="true" />
              GitHub
            </a>
            <a
              href={portfolio.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm text-muted border hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Linkedin size={14} aria-hidden="true" />
              LinkedIn
            </a>
          </motion.div>
        </div>

        {/* Right: avatar card */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        >
          <div className="relative">
            {/* Corner accent marks, drawn in after the card settles */}
            <motion.span
              className="absolute -top-3 -right-3 block w-10 h-10 border-t-2 border-r-2 border-accent origin-top-right"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.75, duration: 0.45, ease: EASE }}
            />
            <motion.span
              className="absolute -bottom-3 -left-3 block w-10 h-10 border-b-2 border-l-2 border-accent origin-bottom-left"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, duration: 0.45, ease: EASE }}
            />

            {/* Card */}
            <div className="bg-surface border rounded w-72 h-72 sm:w-80 sm:h-80 overflow-hidden">
              <img
                src="/selfie.png"
                alt="Muyideen Morenigbade"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>
          </div>
        </motion.div>

      </div>

      {/* Live stats: uptime + visitor count, side by side */}
      <div className="w-full max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <Uptime />
        <VisitorCount />
      </div>
    </section>
  )
}
