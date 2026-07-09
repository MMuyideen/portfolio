import { motion } from 'framer-motion'
import {
  Cloud, Box, FileCode2, GitBranch,
  Activity, Terminal, Shield, Network,
  type LucideIcon,
} from 'lucide-react'
import {
  siGooglecloud, siDigitalocean,
  siKubernetes, siDocker, siArgo,
  siTerraform, siOpentofu,
  siGithubactions, siJenkins, siCircleci,
  siPrometheus, siGrafana, siNewrelic,
  siPython, siGnubash, siAnsible, siVmware,
  type SimpleIcon,
} from 'simple-icons'
import { EASE, VIEWPORT } from '../lib/motion'
import type { SkillCategory } from '../data/portfolio'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Cloud,
  Containers: Box,
  IaC: FileCode2,
  'CI/CD': GitBranch,
  Observability: Activity,
  Scripting: Terminal,
  Security: Shield,
  Networking: Network,
}

const TOOL_ICONS: Record<string, SimpleIcon> = {
  'GCP':            siGooglecloud,
  'DigitalOcean':   siDigitalocean,
  'Kubernetes':     siKubernetes,
  'AKS':            siKubernetes,
  'EKS':            siKubernetes,
  'Docker':         siDocker,
  'ArgoCD':         siArgo,
  'Terraform':      siTerraform,
  'OpenTofu':       siOpentofu,
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

function ToolPill({ tool }: { tool: string }) {
  const icon = TOOL_ICONS[tool]

  return (
    <span className="inline-flex items-center gap-1.5 bg-surface-2 text-muted text-xs px-2.5 py-1 rounded font-mono">
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

function SkillCard({ category, index }: { category: SkillCategory; index: number }) {
  const Icon = CATEGORY_ICONS[category.name] ?? Terminal

  return (
    <motion.div
      className="bg-surface border rounded overflow-hidden flex flex-col hover:border-[rgba(255,255,255,0.18)] transition-colors"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: (index % 4) * 0.06 }}
    >
      <motion.div
        className="h-0.5 bg-accent w-full shrink-0 origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.06 + 0.15 }}
        aria-hidden="true"
      />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-accent select-none">/&gt;</span>
          <Icon size={14} className="text-accent shrink-0" aria-hidden={true} />
          <h3 className="font-mono text-sm font-semibold text-white">{category.name}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {category.tools.map(tool => (
            <ToolPill key={tool} tool={tool} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function TechStack({ skills }: { skills: SkillCategory[] }) {
  return (
    <section id="tech-stack" className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Technical Arsenal
          </h2>
          <p className="text-muted max-w-[52ch] mx-auto leading-relaxed">
            A comprehensive toolkit for modern cloud-native deployment and platform engineering.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((category, i) => (
            <SkillCard key={category.name} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
