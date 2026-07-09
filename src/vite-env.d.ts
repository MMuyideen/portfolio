/// <reference types="vite/client" />

/** Short git commit hash injected at build time (see vite.config.ts). */
declare const __COMMIT_HASH__: string

declare module 'virtual:post-image-dims' {
  export const imageDims: Record<string, [number, number]>
}

declare module 'virtual:post-meta' {
  export const posts: Array<{
    slug: string
    title: string
    date: string
    excerpt: string
    tags: string[]
    draft: boolean
    readingTime: number
  }>
}
