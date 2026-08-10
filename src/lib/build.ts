import { execSync } from 'node:child_process'

/**
 * True when built for a staging preview rather than production
 * (set by .github/workflows/preview.yml). Preview builds are marked noindex so
 * a side-by-side copy never competes with muyideen.dev in search results.
 */
export const isPreview: boolean = process.env.PREVIEW === 'true'

/** Short commit hash of the build, shown in the hero status strip and footer. */
export const commitHash: string = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
})()
