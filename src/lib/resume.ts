import { parse } from 'yaml'
import resumeRaw from '../data/resume.yaml?raw'
import { certifications, projects, type Project } from './data'

interface Metric {
  value: string
  label: string
}

interface ResumeProjectRef {
  id: string
  /** Overrides projects.yaml copy that reads as self-reference on the site. */
  title?: string
  tagline?: string
}

interface ResumeData {
  headline: string
  summary: string
  metrics: Metric[]
  projects: ResumeProjectRef[]
}

const data = parse(resumeRaw) as ResumeData

export const headline = data.headline
export const summary = data.summary

/** The three claimed numbers, plus a certification count that stays current. */
export const metrics: Metric[] = [
  ...data.metrics,
  { value: String(certifications.length), label: 'certifications' },
]

/** Résumé projects resolved from projects.yaml, in the order listed. */
export const resumeProjects: Project[] = data.projects.map(ref => {
  const project = projects.find(p => p.id === ref.id)
  if (!project) throw new Error(`resume.yaml: unknown project id "${ref.id}"`)
  return {
    ...project,
    title: ref.title ?? project.title,
    tagline: ref.tagline ?? project.tagline,
  }
})
