import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * One folder per post: src/content/posts/<slug>/index.md with images alongside.
 * The folder name is the slug (and the URL: /blog/<slug>).
 */
const posts = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().default(''),
    // Drop empty placeholder tags and duplicates (legacy Hashnode exports).
    tags: z
      .array(z.string())
      .default([])
      .transform(tags => [...new Set(tags.filter(t => t.trim() !== ''))]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { posts }
