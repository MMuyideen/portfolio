// Generates public/sitemap.xml from the static routes plus every non-draft
// post in src/content/posts. Run automatically before the Vite build, so the
// post list is never hand-maintained.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const SITE_URL = 'https://www.muyideen.dev'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, 'src', 'content', 'posts')
const outFile = join(root, 'public', 'sitemap.xml')

/** @type {{ loc: string, changefreq: string, priority: string, lastmod?: string }[]} */
const urls = [
  { loc: `${SITE_URL}/`, changefreq: 'monthly', priority: '1.0' },
  { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: '0.8' },
]

for (const file of readdirSync(postsDir)) {
  if (!file.endsWith('.md')) continue
  const raw = readFileSync(join(postsDir, file), 'utf8')
  const { data } = matter(raw)
  if (data.draft === true) continue
  const slug = file.replace(/\.md$/, '')
  urls.push({
    loc: `${SITE_URL}/blog/${slug}`,
    changefreq: 'yearly',
    priority: '0.6',
    lastmod: typeof data.date === 'string' ? data.date : undefined,
  })
}

const body = urls
  .map(u => {
    const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url>
    <loc>${u.loc}</loc>${lastmod}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(outFile, xml)
console.log(`sitemap.xml written with ${urls.length} URLs`)
