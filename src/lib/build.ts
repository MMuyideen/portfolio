import { execSync } from 'node:child_process'

/** Short commit hash of the build, shown in the hero status strip and footer. */
export const commitHash: string = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
})()
