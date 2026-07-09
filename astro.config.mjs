import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export default defineConfig({
  site: 'https://www.muyideen.dev',
  integrations: [react(), sitemap()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaHidden: 'true',
            tabIndex: -1,
          },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline scripts: the CSP is script-src 'self' (external files only).
      assetsInlineLimit: 0,
    },
  },
})
