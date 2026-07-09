import { parse } from 'yaml'
import projectsRaw from '../data/projects.yaml?raw'
import experienceRaw from '../data/experience.yaml?raw'
import certificationsRaw from '../data/certifications.yaml?raw'
import educationRaw from '../data/education.yaml?raw'
import skillsRaw from '../data/skills.yaml?raw'

export interface Project {
  id: string
  title: string
  tagline: string
  /** Longer case-study paragraph; only featured projects need one. */
  detail?: string
  featured?: boolean
  stack: string[]
  github?: string
  /** Slug of a published post in src/content/posts. */
  writeup?: string
  /** Public path to a diagram PNG, or "architecture" for the site SVG. */
  diagram?: string
}

export interface ExperienceEntry {
  id: string
  role: string
  company: string
  period: string
  bullets: string[]
}

export interface Certification {
  issuer: string
  title: string
  date: string // YYYY-MM
  verifyUrl: string
  badge?: string
}

export interface EducationEntry {
  degree: string
  institution: string
  period: string
  url?: string
}

export interface SkillCategory {
  name: string
  tools: string[]
}

export const projects = parse(projectsRaw) as Project[]
export const experience = parse(experienceRaw) as ExperienceEntry[]
export const certifications = parse(certificationsRaw) as Certification[]
export const education = parse(educationRaw) as EducationEntry[]
export const skills = parse(skillsRaw) as SkillCategory[]

export const featuredProjects = projects.filter(p => p.featured)
export const otherProjects = projects.filter(p => !p.featured)

/** "2026-01" → "Jan 2026" */
export function formatMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number)
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
