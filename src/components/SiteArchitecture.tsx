import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Lightbox } from './Lightbox'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import architectureDiagram from '../content/posts/how-this-site-works/architecture.svg'

const DIAGRAM_ALT =
  'Architecture diagram: GitHub Actions authenticates to Azure with OIDC, Terraform provisions a Static Web App and Table Storage, and visitors reach the site over HTTPS while a managed Function increments the visitor counter'

/** The site as its own case study: architecture diagram + link to the write-up. */
export function SiteArchitecture() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="cat architecture.svg" title="How this site works" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="mt-10"
        >
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Enlarge architecture diagram"
            className="block w-full rounded-lg border overflow-hidden cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img
              src={architectureDiagram}
              alt={DIAGRAM_ALT}
              className="w-full"
              loading="lazy"
              decoding="async"
            />
          </button>

          <p className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-sans text-sm text-muted leading-relaxed">
              This portfolio is its own case study: Terraform-provisioned Azure Static
              Web Apps, keyless OIDC deploys, and a serverless visitor counter.
            </span>
            <Link
              to="/blog/how-this-site-works"
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent/80 transition-colors rounded-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              read the write-up
              <ArrowRight
                size={13}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </p>
        </motion.div>

        <Lightbox
          src={expanded ? architectureDiagram : null}
          alt={DIAGRAM_ALT}
          onClose={() => setExpanded(false)}
        />
      </div>
    </section>
  )
}
