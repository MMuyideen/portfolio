// Generates public/sitemap.xml and public/rss.xml from the static routes plus
// every non-draft post in src/content/posts. Runs automatically before the
// Vite build, so neither list is ever hand-maintained.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const SITE_URL = 'https://www.muyideen.dev'
const SITE_TITLE = 'Muyideen Morenigbade — DevOps & Cloud Engineer'
const SITE_DESCRIPTION =
  'Field notes on Azure, Terraform, OpenShift and CI/CD from building and running cloud platforms.'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, 'src', 'content', 'posts')

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Posts live in src/content/posts/<slug>/index.md (images alongside); flat
 * <slug>.md files are still supported.
 */
function loadPosts() {
  const posts = []
  for (const entry of readdirSync(postsDir)) {
    if (entry.startsWith('.')) continue
    const entryPath = join(postsDir, entry)
    let slug
    let file
    if (statSync(entryPath).isDirectory()) {
      slug = entry
      file = join(entryPath, 'index.md')
      if (!existsSync(file)) continue
    } else if (entry.endsWith('.md')) {
      slug = entry.replace(/\.md$/, '')
      file = entryPath
    } else {
      continue
    }
    const { data } = matter(readFileSync(file, 'utf8'))
    if (data.draft === true) continue
    posts.push({
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      date: typeof data.date === 'string' ? data.date : undefined,
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
    })
  }
  return posts.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}

const posts = loadPosts()

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
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`,
)
console.log(`rss.xml written with ${posts.length} items`)
