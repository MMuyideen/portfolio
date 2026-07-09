import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GitHubIcon } from './GitHubIcon'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT, slideIn } from '../lib/motion'
import type { Project } from '../data/portfolio'

/** How many projects are visible before the "show all" expander. */
const INITIAL_VISIBLE = 4

function StackDiagram({ stack, id }: { stack: string[]; id: string }) {
  const mid = Math.ceil(stack.length / 2)
  const top = stack.slice(0, mid)
  const bottom = stack.slice(mid)

  return (
    <div className="w-full flex flex-col items-center font-mono text-xs select-none">
      <div className="flex flex-wrap justify-center gap-2">
        {top.map(item => (
          <div
            key={item}
            className="border border-accent/30 bg-[#0d1219] text-accent/80 px-3 py-1.5 rounded"
          >
            {item}
          </div>
        ))}
      </div>

      {bottom.length > 0 && (
        <>
          <div className="flex justify-center gap-10 my-0">
            {bottom.map((_, i) => (
              <div key={i} className="w-px h-5 bg-accent/20" />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {bottom.map(item => (
              <div
                key={item}
                className="border border-accent/15 bg-[#0d1219] text-muted px-3 py-1.5 rounded"
              >
                {item}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-[10px] text-muted/40 tracking-widest uppercase">
        {id}.arch
      </p>
    </div>
  )
}

function DiagramPanel({ project }: { project: Project }) {
  if (project.diagram) {
    return (
      <div className="rounded border overflow-hidden w-full h-full min-h-[300px]">
        <img
          src={project.diagram}
          alt={`${project.title} architecture diagram`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  return (
    <div className="bg-surface border rounded overflow-hidden flex flex-col w-full h-full min-h-[300px]">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b bg-surface-2 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-accent">$ {project.command}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <StackDiagram stack={project.stack} id={project.id} />
      </div>
    </div>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const diagramLeft = index % 2 === 0
  const githubLink = project.links.find(l => l.label === 'GitHub')
  const description = project.description.map(d => d.replace(/^# /, '')).join(' ')

  const textPanel = (
    <motion.div className="flex flex-col justify-center" {...slideIn(!diagramLeft)}>
      <p className="font-mono text-xs text-accent tracking-widest mb-2">
        {'// '}Project {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-5">
        {project.title}
      </h3>
      <div className="bg-surface-2 border rounded p-4 mb-5">
        <p className="text-muted leading-relaxed text-sm">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {project.stack.map((tag, i) => (
          <motion.span
            key={tag}
            className="font-mono text-[11px] border border-accent/40 text-accent px-2.5 py-1 rounded"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.35, ease: EASE, delay: 0.2 + i * 0.04 }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
      {githubLink && (
        <a
          href={githubLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-white transition-colors w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <GitHubIcon size={14} aria-hidden="true" />
          Source
        </a>
      )}
    </motion.div>
  )

  const diagramPanel = (
    <motion.div
      className="h-full min-h-[300px] sm:min-h-[360px]"
      whileHover={{ y: -4 }}
      {...slideIn(diagramLeft)}
    >
      <DiagramPanel project={project} />
    </motion.div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {diagramLeft ? (
        <>
          {diagramPanel}
          {textPanel}
        </>
      ) : (
        <>
          {textPanel}
          {diagramPanel}
        </>
      )}
    </div>
  )
}

export function Projects({ projects }: { projects: Project[] }) {
  const [expanded, setExpanded] = useState(false)
  const collapsible = projects.length > INITIAL_VISIBLE
  const visible =
    collapsible && !expanded ? projects.slice(0, INITIAL_VISIBLE) : projects
  const hiddenCount = projects.length - INITIAL_VISIBLE

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="ls -la projects/" title="Featured Architecture" />

        <div className="mt-16 space-y-20 lg:space-y-28">
          {visible.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))}
        </div>

        {collapsible && (
          <div className="mt-16 flex justify-center">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded(prev => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded border font-mono text-sm text-muted hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {expanded ? (
                <>
                  <ChevronUp size={14} aria-hidden="true" />
                  show fewer projects
                </>
              ) : (
                <>
                  <ChevronDown size={14} aria-hidden="true" />
                  show all projects
                  <span className="text-accent">+{hiddenCount}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
