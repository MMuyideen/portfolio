import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { useTerminalSequence, type TerminalStep } from '../hooks/useTerminalSequence'
import { EASE } from '../lib/motion'
import { portfolio } from '../data/portfolio'
import { RESUME_FILENAME } from '../lib/resume'

const STEPS: readonly TerminalStep[] = [
  { kind: 'output', text: '> Hello, World! I am' },
]

/**
 * The specialisms a recruiter is likely to be searching for, spelled out.
 * They repeat what the paragraph above says in the words a job description
 * would use, which the prose deliberately does not.
 */
const KEYWORDS = [
  'Cloud Infrastructure',
  'Kubernetes',
  'Platform Engineering',
  'Infrastructure as Code',
  'DevOps',
]

export function Hero() {
  const { currentText, currentKind, idle } = useTerminalSequence(STEPS)

  const promptText = idle ? '> Hello, World! I am' : currentText
  const showCursor = !idle && currentKind === 'output'

  return (
    <section id="hero" className="relative px-6 pt-28 pb-16 sm:pb-20">
      {/* Graticule: faint dot grid fading out below the fold. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(201,209,217,0.05)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
      />
      <div className="w-full max-w-content mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

        {/* Left: text content */}
        <div className="min-w-0">
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
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-fg leading-[1.05] tracking-tight mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55, ease: EASE }}
          >
            {/* One word per line visually, but the spaces have to survive:
                block spans alone concatenate to "MuyideenMorenigbade" in the
                accessibility tree. The whitespace nodes between them don't
                render — they only exist for the text content. */}
            {portfolio.name.split(' ').map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <span className="block">{word}</span>
              </Fragment>
            ))}
          </motion.h1>

          {/* Role — the positioning line, sized to be read before the prose. */}
          <motion.p
            className="font-mono text-lg sm:text-xl font-semibold text-accent mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5, ease: EASE }}
          >
            {portfolio.role}
          </motion.p>

          {/* What he actually does */}
          <motion.p
            className="text-base text-muted leading-relaxed mb-6 max-w-[54ch]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.08, duration: 0.5, ease: EASE }}
          >
            {portfolio.positioning}
          </motion.p>

          {/* Specialisms */}
          <motion.ul
            className="flex flex-wrap gap-x-2 gap-y-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.16, duration: 0.5, ease: EASE }}
          >
            {KEYWORDS.map(keyword => (
              <li
                key={keyword}
                className="font-mono text-[11px] text-muted border border-[rgb(var(--border)/0.1)] rounded px-2 py-1"
              >
                {keyword}
              </li>
            ))}
          </motion.ul>

          {/* Actions: one primary, the rest quiet. */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.24, duration: 0.5, ease: EASE }}
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded font-mono text-sm font-semibold bg-accent text-accent-contrast hover:bg-accent/90 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              View my work
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href={portfolio.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono text-sm text-muted border hover:text-fg hover:border-[rgb(var(--border)/0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <GitHubIcon size={14} aria-hidden="true" />
              GitHub
            </a>
            <a
              href="/resume.pdf"
              download={RESUME_FILENAME}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded font-mono text-sm text-muted border hover:text-fg hover:border-[rgb(var(--border)/0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <Download size={14} aria-hidden="true" />
              Résumé
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
            <div className="bg-surface border rounded w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 overflow-hidden">
              <img
                src="/selfie.png"
                alt="Muyideen Morenigbade"
                width={320}
                height={320}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
