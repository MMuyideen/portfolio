// gray-matter (post frontmatter parsing) expects a Node `Buffer` global.
// This side-effect module installs one for the browser. It must be imported
// before any module that parses posts, so keep it as the first import in the
// entry point (ES imports evaluate before the importing module's own body).
import { Buffer } from 'buffer'

const globalScope = globalThis as typeof globalThis & { Buffer?: typeof Buffer }
if (typeof globalScope.Buffer === 'undefined') {
  globalScope.Buffer = Buffer
}
