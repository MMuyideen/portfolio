import { portfolio } from '../data/portfolio'

/**
 * What the résumé PDF is called once it lands in someone's Downloads folder.
 * The URL stays /resume.pdf so existing links keep working — this is the
 * `download` attribute, which only renames the saved file.
 *
 * Lives here rather than in pages/Resume so the command palette can use it
 * without pulling the whole résumé route (and its stylesheet) into its chunk.
 */
export const RESUME_FILENAME = `${portfolio.name.replace(/\s+/g, '_')}_resume.pdf`
