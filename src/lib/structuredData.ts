import { portfolio } from '../data/portfolio'

export const SITE_URL = 'https://www.muyideen.dev'

/**
 * schema.org JSON-LD. Emitted inside <Helmet> as an `application/ld+json` data
 * block — not executable script, so the `script-src 'self'` CSP does not apply.
 * Everything is derived from portfolio.ts so the markup cannot contradict the
 * page it describes.
 */

/** The person behind the site: identity, credentials, and what they work on. */
export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.name,
    jobTitle: portfolio.role,
    url: SITE_URL,
    email: `mailto:${portfolio.email}`,
    image: `${SITE_URL}/og-image.png`,
    sameAs: [portfolio.github, portfolio.linkedin],
    knowsAbout: portfolio.skills.flatMap(category => category.tools),
    alumniOf: portfolio.education.map(entry => ({
      '@type': 'EducationalOrganization',
      name: entry.institution,
      ...(entry.url ? { url: entry.url } : {}),
    })),
    hasCredential: portfolio.certifications.map(cert => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert.title,
      credentialCategory: 'certification',
      url: cert.verifyUrl,
      recognizedBy: { '@type': 'Organization', name: cert.issuer },
    })),
    worksFor: portfolio.experience.slice(0, 1).map(entry => ({
      '@type': 'Organization',
      name: entry.company,
    })),
  }
}

/** The site itself, so search engines can attribute the domain to the person. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${portfolio.name} — ${portfolio.role}`,
    url: SITE_URL,
    author: { '@type': 'Person', name: portfolio.name, url: SITE_URL },
    inLanguage: 'en',
  }
}

/** A single blog post. `date` is the ISO date string from frontmatter. */
export function blogPostingSchema(post: {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
}) {
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: `${SITE_URL}/og-image.png`,
    inLanguage: 'en',
    ...(post.tags.length > 0 ? { keywords: post.tags.join(', ') } : {}),
    author: { '@type': 'Person', name: portfolio.name, url: SITE_URL },
    publisher: { '@type': 'Person', name: portfolio.name, url: SITE_URL },
  }
}

/** The résumé route, described as a profile page about the person. */
export function profilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/resume`,
    name: `Résumé — ${portfolio.name}`,
    inLanguage: 'en',
    mainEntity: { '@type': 'Person', name: portfolio.name, url: SITE_URL },
  }
}
