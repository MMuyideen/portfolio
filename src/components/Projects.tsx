import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { Lightbox } from './Lightbox'
import { ProjectFlowDiagram } from './ProjectFlowDiagram'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import { featuredProjects, supportingProjects, type Project } from '../data/portfolio'

/** Shell-comment description flattened into a sentence. */
function asSentence(description: string[]): string {
  return description.map(line => line.replace(/^#\s?/, '')).join(' ')
}

function githubHref(project: Project): string | undefined {
  return project.links.find(link => /github\.com/.test(link.href))?.href
}

/* ── Featured: full case studies ─────────────────────────────────────────── */

/** The repository's own diagram, click-to-enlarge; or the drawn fan-out. */
function Visual({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false)

  if (project.diagram) {
    const alt = `${project.title} architecture diagram`
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Enlarge ${alt}`}
          className="block h-full min-h-[260px] w-full cursor-zoom-in overflow-hidden rounded border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <img
            src={project.diagram}
            alt={alt}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </button>
        <Lightbox
          src={expanded ? project.diagram : null}
          alt={alt}
          onClose={() => setExpanded(false)}
        />
      </>
    )
  }

  if (project.flow) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center rounded border bg-surface-2">
        <ProjectFlowDiagram flow={project.flow} label={`${project.id}.arch`} />
      </div>
    )
  }

  return null
}

function CaseStudy({ project, index }: { project: Project; index: number }) {
  const study = project.caseStudy
  const github = githubHref(project)

  return (
    <motion.article
      className="overflow-hidden rounded-lg border bg-surface"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE }}
      aria-labelledby={`${project.id}-title`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-[rgb(var(--border)/0.07)] px-6 py-5 sm:px-8">
        <div className="min-w-0">
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-accent">
            Case study {String(index + 1).padStart(2, '0')}
          </p>
          <h3
            id={`${project.id}-title`}
            className="text-xl font-bold leading-tight text-fg sm:text-2xl"
          >
            {project.title}
          </h3>
        </div>
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-[rgb(var(--border)/0.22)] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <GitHubIcon size={13} aria-hidden="true" />
            Source
            <ArrowUpRight
              size={12}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}
      </div>

      {/* Body: diagram beside problem/solution */}
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10">
        <Visual project={project} />

        <div className="min-w-0 space-y-6">
          {study ? (
            <>
              <Field label="Problem">{study.problem}</Field>
              <Field label="Solution">{study.approach}</Field>
            </>
          ) : (
            <Field label="Overview">{asSentence(project.description)}</Field>
          )}
        </div>
      </div>

      {/* Engineering decisions */}
      {study && (
        <div className="border-t border-[rgb(var(--border)/0.07)] px-6 py-6 sm:px-8">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">
            Engineering decisions
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
            {study.decisions.map(decision => (
              <li
                key={decision}
                className="flex gap-2.5 text-sm leading-relaxed text-muted"
              >
                <span
                  className="mt-0.5 shrink-0 font-mono text-accent/70"
                  aria-hidden="true"
                >
                  #
                </span>
                {decision}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stack */}
      <div className="flex flex-wrap gap-2 border-t border-[rgb(var(--border)/0.07)] bg-surface-2/50 px-6 py-4 sm:px-8">
        {project.stack.map(tool => (
          <span
            key={tool}
            className="rounded border border-accent/30 px-2.5 py-1 font-mono text-[11px] text-accent/90"
          >
            {tool}
          </span>
        ))}
      </div>
    </motion.article>
  )
}

function Field({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </div>
  )
}

/* ── Supporting: compact cards ───────────────────────────────────────────── */

/** Stack chips are capped so a card with nine technologies doesn't outgrow one
 *  with five — the full list is on the repository. */
const CHIP_LIMIT = 4

function SupportingCard({ project, index }: { project: Project; index: number }) {
  const github = githubHref(project)
  const shown = project.stack.slice(0, CHIP_LIMIT)
  const rest = project.stack.length - shown.length

  const card = (
    <>
      <h3 className="font-mono text-base font-semibold leading-snug text-fg transition-colors group-hover:text-accent">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
        {asSentence(project.description)}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {shown.map(tool => (
          <span
            key={tool}
            className="rounded border border-[rgb(var(--border)/0.12)] px-1.5 py-0.5 font-mono text-[10px] text-muted"
          >
            {tool}
          </span>
        ))}
        {rest > 0 && (
          <span className="px-1 py-0.5 font-mono text-[10px] text-muted">
            +{rest}
          </span>
        )}
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-accent">
        <GitHubIcon size={12} aria-hidden="true" />
        Source
        <ArrowUpRight
          size={12}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </>
  )

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: EASE, delay: (index % 3) * 0.06 }}
    >
      {github ? (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-full flex-col rounded-lg border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {card}
        </a>
      ) : (
        <div className="group flex h-full flex-col rounded-lg border bg-surface p-5">
          {card}
        </div>
      )}
    </motion.li>
  )
}

/* ── Section ─────────────────────────────────────────────────────────────── */

/**
 * Two tiers, both always in the DOM.
 *
 * The previous version sliced the array behind a "show all" expander, which
 * meant eight of twelve projects were missing from the prerendered HTML that
 * social scrapers and non-JS crawlers read. Weight is now carried by layout —
 * four case studies, then a compact grid — so nothing has to be hidden to keep
 * the section from sprawling.
 */
export function Projects() {
  const featured = featuredProjects()
  const supporting = supportingProjects()

  return (
    <section id="projects" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionHeader command="ls -la projects/" title="Selected work" />

        <div className="mt-12 space-y-8 lg:space-y-12">
          {featured.map((project, i) => (
            <CaseStudy key={project.id} project={project} index={i} />
          ))}
        </div>

        {supporting.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-mono text-base font-semibold">
                More infrastructure builds
              </h3>
              <p className="font-mono text-xs text-muted">
                {supporting.length} repositories
              </p>
            </div>
            <div className="mt-4 h-px bg-[rgb(var(--border)/0.07)]" />

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {supporting.map((project, i) => (
                <SupportingCard key={project.id} project={project} index={i} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
