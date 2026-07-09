/// <reference types="vite/client" />

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
