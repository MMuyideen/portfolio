import { motion } from 'framer-motion'
import {
  siKubernetes, siDocker, siArgo,
  siTerraform,
  siGithubactions, siJenkins, siCircleci,
  siPrometheus, siGrafana, siNewrelic,
  siGooglecloud, siDigitalocean,
  siPython, siGnubash,
  type SimpleIcon,
} from 'simple-icons'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import type { Skills } from '../data/portfolio'

/**
 * Icons only where simple-icons still ships a mark. Azure, AWS and the
 * abstract entries (GitOps, RBAC, DNS) have none, so the tiers that contain
 * them are typographic — a half-iconed row reads as broken, and the brief
 * warns against logo overload regardless.
 */
const TOOL_ICONS: Record<string, SimpleIcon> = {
  'Kubernetes':     siKubernetes,
  'AKS':            siKubernetes,
  'EKS':            siKubernetes,
  'Docker':         siDocker,
  'ArgoCD':         siArgo,
  'Terraform':      siTerraform,
  'GitHub Actions': siGithubactions,
  'Jenkins':        siJenkins,
  'CircleCI':       siCircleci,
  'Prometheus':     siPrometheus,
  'Grafana':        siGrafana,
  'New Relic':      siNewrelic,
  'GCP':            siGooglecloud,
  'DigitalOcean':   siDigitalocean,
  'Python':         siPython,
  'Bash':           siGnubash,
}

/** "CI/CD" → "ci_cd" — categories rendered as yaml keys. */
function yamlKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function ToolIcon({ tool, size }: { tool: string; size: number }) {
  const icon = TOOL_ICONS[tool]
  if (!icon) return null
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className="shrink-0 opacity-70"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  )
}

/** A labelled tier: the yaml key on the left rail, the tools beside it. */
function Tier({
  name,
  caption,
  delay,
  children,
}: {
  name: string
  caption: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-6"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      <div className="md:pt-1">
        <p className="font-mono text-sm">
          <span className="text-accent">{yamlKey(name)}</span>
          <span className="text-muted">:</span>
        </p>
        <p className="mt-1 font-mono text-[11px] leading-snug text-muted">
          {caption}
        </p>
      </div>
      <div className="min-w-0">{children}</div>
    </motion.div>
  )
}

/**
 * The stack in three weights instead of eight equal rows.
 *
 * The flat version gave Terraform and DigitalOcean the same visual claim,
 * which read as a list of everything ever touched. Now: five technologies at
 * full size, the delivery tooling below them, and the long tail grouped small.
 */
export function TechStack({ skills }: { skills: Skills }) {
  return (
    <section id="tech-stack" className="px-6 py-24">
      <div className="mx-auto max-w-content">
        <SectionHeader command="cat stack.yaml" title="Stack" />

        <div className="mt-10 space-y-10 rounded-lg border bg-surface p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">

          {/* Core — the five that carry the work. */}
          <Tier name="Core" caption="in nearly every project here" delay={0.05}>
            <ul className="flex flex-wrap gap-2.5">
              {skills.core.map(tool => (
                <li
                  key={tool}
                  className="inline-flex items-center gap-2 rounded border border-accent/40 bg-accent/[0.06] px-3.5 py-2 font-mono text-sm font-semibold text-accent"
                >
                  <ToolIcon tool={tool} size={14} />
                  {tool}
                </li>
              ))}
            </ul>
          </Tier>

          <div className="h-px bg-[rgba(255,255,255,0.06)]" aria-hidden="true" />

          {/* Platform — how the core gets built and shipped. */}
          <Tier name="Platform" caption="build, deliver and run" delay={0.1}>
            <ul className="flex flex-wrap gap-2">
              {skills.platform.map(tool => (
                <li
                  key={tool}
                  className="inline-flex items-center gap-1.5 rounded border border-[rgba(255,255,255,0.14)] bg-surface-2 px-3 py-1.5 font-mono text-xs text-white/85"
                >
                  <ToolIcon tool={tool} size={12} />
                  {tool}
                </li>
              ))}
            </ul>
          </Tier>

          <div className="h-px bg-[rgba(255,255,255,0.06)]" aria-hidden="true" />

          {/* Supporting — the long tail, grouped by what it is for. */}
          <Tier name="Supporting" caption="grouped by what it is for" delay={0.15}>
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {skills.supporting.map(category => (
                <div key={category.name} className="min-w-0">
                  <dt className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                    {category.name}
                  </dt>
                  <dd className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-muted">
                    {category.tools.map((tool, i) => (
                      <span key={tool} className="inline-flex items-center gap-1.5">
                        <ToolIcon tool={tool} size={11} />
                        {tool}
                        {i < category.tools.length - 1 && (
                          <span className="text-muted" aria-hidden="true">·</span>
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Tier>
        </div>
      </div>
    </section>
  )
}
