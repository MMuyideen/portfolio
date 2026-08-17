import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Lightbox } from './Lightbox'
import { Uptime } from './Uptime'
import { VisitorCount } from './VisitorCount'
import { EASE, VIEWPORT } from '../lib/motion'
import architectureDiagram from '../content/posts/how-this-site-works/architecture.svg'

const DIAGRAM_ALT =
  'Architecture diagram: GitHub Actions authenticates to Azure with OIDC, Terraform provisions a Static Web App and Table Storage, and visitors reach the site over HTTPS while a managed Function increments the visitor counter'

/** What the diagram shows, spelled out — one line per moving part. */
const LAYERS = [
  {
    name: 'Infrastructure as code',
    detail: 'Terraform provisions every Azure resource, with remote state in a storage account.',
  },
  {
    name: 'CI/CD',
    detail: 'GitHub Actions plans and applies on push to main, then uploads the built site.',
  },
  {
    name: 'Authentication',
    detail: 'OIDC federated identity — no long-lived Azure credentials stored as repository secrets.',
  },
  {
    name: 'Hosting',
    detail: 'Azure Static Web Apps, serving HTML prerendered at build time for every route.',
  },
  {
    name: 'Visitor counter',
    detail: 'A managed Function increments a row in Azure Table Storage and returns the total.',
  },
]

/**
 * The site as its own case study.
 *
 * Promoted from a diagram with a caption to a full section: the architecture,
 * what each layer is, and the two numbers this deployment actually produces —
 * so the claim is demonstrated on the page rather than asserted.
 */
export function SiteArchitecture() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section
      id="architecture"
      className="border-y border-[rgb(var(--border)/0.07)] bg-surface/40 px-6 py-24"
      aria-labelledby="architecture-heading"
    >
      <div className="mx-auto max-w-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
            Infrastructure
          </p>
          <h2
            id="architecture-heading"
            className="max-w-[22ch] text-2xl font-bold leading-tight text-fg sm:text-3xl"
          >
            This portfolio is infrastructure too.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">
            I didn’t just build a website. I built and automated the
            infrastructure behind it — Terraform, GitHub Actions, OIDC and
            Azure — and it deploys itself on every push to main.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Enlarge architecture diagram"
              className="block w-full cursor-zoom-in overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <img
                src={architectureDiagram}
                alt={DIAGRAM_ALT}
                className="w-full"
                loading="lazy"
                decoding="async"
              />
            </button>
          </motion.div>

          {/* What each layer is */}
          <motion.dl
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
          >
            {LAYERS.map(layer => (
              <div
                key={layer.name}
                className="border-l border-[rgb(var(--border)/0.1)] pl-4"
              >
                <dt className="font-mono text-xs text-accent">{layer.name}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">
                  {layer.detail}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Live from this deployment */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Uptime />
          <VisitorCount />
        </div>

        <motion.p
          className="mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        >
          <Link
            to="/blog/how-this-site-works"
            className="group inline-flex items-center gap-2 rounded border px-4 py-2.5 font-mono text-sm text-muted transition-colors hover:border-[rgb(var(--border)/0.22)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Read the architecture
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </motion.p>

        <Lightbox
          src={expanded ? architectureDiagram : null}
          alt={DIAGRAM_ALT}
          onClose={() => setExpanded(false)}
        />
      </div>
    </section>
  )
}
