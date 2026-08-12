import { motion } from 'framer-motion'
import {
  siGooglecloud, siDigitalocean,
  siKubernetes, siDocker, siArgo,
  siTerraform,
  siGithubactions, siJenkins, siCircleci,
  siPrometheus, siGrafana, siNewrelic,
  siPython, siGnubash, siAnsible, siVmware,
  type SimpleIcon,
} from 'simple-icons'
import { SectionHeader } from './SectionHeader'
import { EASE, VIEWPORT } from '../lib/motion'
import type { SkillCategory } from '../data/portfolio'

const TOOL_ICONS: Record<string, SimpleIcon> = {
  'GCP':            siGooglecloud,
  'DigitalOcean':   siDigitalocean,
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
  'Python':         siPython,
  'Bash':           siGnubash,
  'Ansible':        siAnsible,
  'VMware':         siVmware,
}

/** "CI/CD" → "ci_cd" — categories rendered as yaml keys. */
function yamlKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function ToolPill({ tool }: { tool: string }) {
  const icon = TOOL_ICONS[tool]

  return (
    <span className="inline-flex items-center gap-1.5 bg-surface-2 border border-[rgba(255,255,255,0.06)] text-muted text-xs px-2.5 py-1 rounded font-mono hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-colors">
      {icon ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={11}
          height={11}
          fill="currentColor"
          className="opacity-60 shrink-0"
          aria-hidden="true"
        >
          <path d={icon.path} />
        </svg>
      ) : (
        <span className="text-accent/50 text-[9px] shrink-0">•</span>
      )}
      {tool}
    </span>
  )
}

/**
 * The stack as a manifest, not a card grid: one panel styled like a yaml
 * file, categories as keys, tools as values.
 */
export function TechStack({ skills }: { skills: SkillCategory[] }) {
  return (
    <section id="tech-stack" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader command="cat stack.yaml" title="Technical Arsenal" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          className="mt-10 rounded-lg border bg-surface p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {skills.map((category, i) => (
              <motion.div
                key={category.name}
                className="flex flex-col gap-2.5"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.45, ease: EASE, delay: 0.15 + (i % 4) * 0.06 }}
              >
                <p className="font-mono text-sm">
                  <span className="text-accent">{yamlKey(category.name)}</span>
                  <span className="text-muted">:</span>
                  <span className="sr-only"> {category.name}</span>
                </p>
                <div className="flex flex-wrap gap-2 pl-4 border-l border-[rgba(255,255,255,0.06)]">
                  {category.tools.map(tool => (
                    <ToolPill key={tool} tool={tool} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
