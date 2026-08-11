import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Download, Printer } from 'lucide-react'
import { portfolio } from '../data/portfolio'
import { RESUME_FILENAME } from '../lib/resume'
import { profilePageSchema } from '../lib/structuredData'
import '../styles/resume.css'

const SITE_URL = 'https://www.muyideen.dev'

/** Strip the scheme so the printed résumé shows clean, typeable addresses. */
const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '')

/** "https://github.com/me/repo" → "me/repo" — full URLs crowd the print margin. */
const repo = (url: string) => bare(url).replace(/^github\.com\//, '')

/** "2026-08" → "Aug 2026" */
function formatMonth(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number)
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1)).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** Project `description` is written as shell comments; unwrap it into a sentence. */
function asSentence(description: string[]): string {
  return description
    .map(line => line.replace(/^#\s?/, '').trim())
    .filter(Boolean)
    .join(' ')
}

const SECTIONS = [
  { title: 'Summary', command: 'whoami' },
  { title: 'Impact', command: 'metrics --top' },
  { title: 'Experience', command: 'git log --oneline' },
  { title: 'Selected work', command: 'ls projects/' },
  { title: 'Toolbox', command: 'which --all' },
  { title: 'Certifications', command: 'verify --issuer' },
  { title: 'Education', command: 'cat education' },
]

/**
 * The résumé, rendered from the same data as the home page and printed to
 * /resume.pdf by scripts/build-resume-pdf.mjs. Intentionally free of scroll
 * reveals: anything below the fold would print at opacity 0.
 */
export function Resume() {
  const { resume, certifications, education, experience, skills } = portfolio

  // Scopes the print rules in resume.css so printing any other page is normal.
  useEffect(() => {
    document.body.classList.add('resume-doc')
    return () => document.body.classList.remove('resume-doc')
  }, [])

  const metrics = [
    ...resume.metrics,
    { value: String(certifications.length), label: 'certifications' },
  ]

  const projects = resume.projects.map(ref => {
    const project = portfolio.projects.find(p => p.id === ref.id)
    if (!project) throw new Error(`resume: unknown project id "${ref.id}"`)
    const github = project.links.find(link => /github\.com/.test(link.href))
    return {
      id: ref.id,
      title: ref.title ?? project.title,
      summary: ref.summary ?? asSentence(project.description),
      stack: project.stack,
      github: github?.href,
    }
  })

  const contacts = [
    { label: portfolio.email, href: `mailto:${portfolio.email}` },
    { label: bare(SITE_URL), href: SITE_URL },
    { label: bare(portfolio.linkedin), href: portfolio.linkedin },
    { label: bare(portfolio.github), href: portfolio.github },
  ]

  const updated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const description = `Résumé of ${portfolio.name}, ${portfolio.role} — Azure and AWS platforms built with Terraform, Kubernetes, and CI/CD.`

  return (
    <>
      <Helmet>
        <title>Résumé — {portfolio.name}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/resume`} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`Résumé — ${portfolio.name}`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/resume`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Résumé — ${portfolio.name}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">
          {JSON.stringify(profilePageSchema())}
        </script>
      </Helmet>

      <div className="resume">
        <article className="rz-sheet">
          <header>
            <p className="rz-kicker">
              <span>$</span> cat resume.md
            </p>
            <h1 className="rz-name">{portfolio.name}</h1>
            <p className="rz-role">{portfolio.role}</p>
            <p className="rz-headline">{resume.headline}</p>
            <ul className="rz-contacts">
              {contacts.map(contact => (
                <li key={contact.href}>
                  <a href={contact.href} rel="me">
                    {contact.label}
                  </a>
                </li>
              ))}
            </ul>
          </header>

          <div className="rz-actions">
            <a
              className="rz-btn rz-btn--solid"
              href="/resume.pdf"
              download={RESUME_FILENAME}
            >
              <Download size={15} aria-hidden="true" />
              Download PDF
            </a>
            <button
              type="button"
              className="rz-btn"
              onClick={() => window.print()}
            >
              <Printer size={15} aria-hidden="true" />
              Print
            </button>
            <span className="rz-updated">updated {updated}</span>
          </div>

          <Section index={0} id="rz-summary">
            <p className="rz-lede">{resume.summary}</p>
          </Section>

          <Section index={1} id="rz-impact">
            <dl className="rz-metrics">
              {metrics.map(metric => (
                <div className="rz-metric" key={metric.label}>
                  <dt>{metric.value}</dt>
                  <dd>{metric.label}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section index={2} id="rz-experience" stack>
            {experience.map(entry => (
              <div className="rz-entry" key={`${entry.company}-${entry.period}`}>
                <div className="rz-entry__head">
                  <h3>
                    {entry.role} <span className="rz-org">· {entry.company}</span>
                  </h3>
                  <p className="rz-period">{entry.period}</p>
                </div>
                <ul className="rz-bullets">
                  {entry.bullets.map(bullet => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section index={3} id="rz-work" stack>
            {projects.map(project => (
              <div className="rz-entry" key={project.id}>
                <div className="rz-entry__head">
                  <h3>{project.title}</h3>
                  {project.github && (
                    <p className="rz-period">
                      <a href={project.github}>{repo(project.github)}</a>
                    </p>
                  )}
                </div>
                <p className="rz-summary">{project.summary}</p>
                <ul className="rz-chips">
                  {project.stack.map(tool => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section index={4} id="rz-toolbox">
            <dl className="rz-skills">
              {skills.map(category => (
                <div className="rz-skill" key={category.name}>
                  <dt>{category.name.toLowerCase()}</dt>
                  <dd>{category.tools.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section index={5} id="rz-certs">
            <ul className="rz-certs">
              {certifications.map(cert => (
                <li key={cert.verifyUrl + cert.title}>
                  <a href={cert.verifyUrl} rel="noopener">
                    {cert.badgeImage && (
                      <img
                        src={cert.badgeImage}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <span>
                      <span className="rz-cert__title">{cert.title}</span>
                      <span className="rz-cert__meta">
                        {cert.issuer} · {formatMonth(cert.date)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section index={6} id="rz-education">
            <ul className="rz-education">
              {education.map(entry => (
                <li key={entry.degree}>
                  <span className="rz-edu__degree">
                    {entry.url ? (
                      <a href={entry.url}>{entry.degree}</a>
                    ) : (
                      entry.degree
                    )}
                  </span>
                  <span className="rz-edu__meta">
                    {entry.institution} · {entry.period}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <p className="rz-foot">
            Generated from muyideen.dev — the live version of this document is at{' '}
            {bare(SITE_URL)}/resume.
          </p>
        </article>
      </div>
    </>
  )
}

/** A labelled row: the `$ command` rail on the left, content on the right. */
function Section({
  index,
  id,
  stack,
  children,
}: {
  index: number
  id: string
  stack?: boolean
  children: React.ReactNode
}) {
  const section = SECTIONS[index]
  return (
    <section
      className={`rz-row${index === 0 ? ' rz-row--first' : ''}`}
      aria-labelledby={id}
    >
      <div className="rz-rail">
        <h2 id={id}>{section.title}</h2>
        <p aria-hidden="true">
          <span>$</span> {section.command}
        </p>
      </div>
      <div className={stack ? 'rz-col rz-col--stack' : 'rz-col'}>{children}</div>
    </section>
  )
}
