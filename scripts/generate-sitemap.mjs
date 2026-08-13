// Generates public/sitemap.xml, public/rss.xml and public/site.webmanifest from
// the static routes plus every non-draft post in src/content/posts. Runs
// automatically before the Vite build, so no list is ever hand-maintained.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPosts } from './lib/posts.mjs'

const SITE_URL = 'https://www.muyideen.dev'
const SITE_TITLE = 'Muyideen Morenigbade — Cloud Platform & DevOps Engineer'
// The feed's subject, which is the writing — not the site as a whole.
const SITE_DESCRIPTION =
  'Field notes on Azure, Terraform, OpenShift and CI/CD from building and running cloud platforms.'

// What the whole site is, for the installed app. Kept beside SITE_TITLE so a
// change of role is one edit in one place.
const SITE_SUMMARY =
  'Portfolio and field notes of Muyideen Morenigbade — reliable cloud platforms on Azure and AWS, built with Terraform, Kubernetes and GitOps.'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const posts = loadPosts(root)

// ── sitemap.xml ──────────────────────────────────────────────────────────────

const urls = [
  { loc: `${SITE_URL}/`, changefreq: 'monthly', priority: '1.0' },
  { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: '0.8' },
  ...posts.map(post => ({
    loc: `${SITE_URL}/blog/${post.slug}`,
    changefreq: 'yearly',
    priority: '0.6',
    lastmod: post.date,
  })),
]

const sitemapBody = urls
  .map(u => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>
    <loc>${u.loc}</loc>${lastmod}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  })
  .join('\n')

writeFileSync(
  join(root, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapBody}
</urlset>
`,
)
console.log(`sitemap.xml written with ${urls.length} URLs`)

// ── rss.xml ──────────────────────────────────────────────────────────────────

const rssItems = posts
  .map(post => {
    const link = `${SITE_URL}/blog/${post.slug}`
    const pubDate = post.date
      ? `\n      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>`
      : ''
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>${pubDate}
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
  })
  .join('\n')

/**
 * Dated from the newest post rather than "now", so rss.xml is a pure function
 * of the content. Stamping the current time made every single build dirty a
 * committed file — noise in `git status`, and a diff on every commit once the
 * pre-commit hook started regenerating this.
 */
const lastBuildDate = new Date(
  posts.length > 0
    ? Math.max(...posts.map(post => Date.parse(post.date)))
    : 0,
).toUTCString()

writeFileSync(
  join(root, 'public', 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`,
)
console.log(`rss.xml written with ${posts.length} items`)

// ── site.webmanifest ─────────────────────────────────────────────────────────
// Generated here rather than committed by hand so the installed app's name
// tracks SITE_TITLE with the sitemap and the feed. A hand-written copy is
// exactly the kind of file that keeps the old job title after a rename.
//
// The icons themselves come from `npm run icons` (scripts/build-icons.mjs).

writeFileSync(
  join(root, 'public', 'site.webmanifest'),
  JSON.stringify(
    {
      name: SITE_TITLE,
      short_name: 'Muyideen',
      description: SITE_SUMMARY,
      lang: 'en',
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      // Matches <meta name="theme-color"> in index.html — the page background,
      // not the mark's chip, so the app frame continues the site.
      theme_color: '#0a0e14',
      background_color: '#0a0e14',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        // Full-bleed, mark inside the 80% safe circle, so Android can crop it
        // to whatever shape the launcher uses without clipping the monogram.
        {
          src: '/icons/icon-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2,
  ) + '\n',
)
console.log('site.webmanifest written')
