/** Canonical origin. Kept here so metadata and scripts agree on one value. */
export const SITE_URL = 'https://www.muyideen.dev'

/**
 * Go-live date of this deployment, as a plain calendar date.
 *
 * Stated separately from `LAUNCH` because that instant is +01:00, and
 * `toISOString().slice(0, 10)` on it lands on the previous day — the site was
 * reporting "since 2026-07-02". Display reads this; only the elapsed-time
 * arithmetic reads the instant.
 */
export const LAUNCH_DATE = '2026-07-03'

/**
 * The same moment as an instant, for the uptime clock. Shared with the visitor
 * counter so the two cannot disagree about when "since" began.
 */
export const LAUNCH = new Date(`${LAUNCH_DATE}T00:00:00+01:00`)

/** "July 2026" — the human form used under the visitor count. */
export const LAUNCH_LABEL = new Date(`${LAUNCH_DATE}T12:00:00Z`).toLocaleDateString(
  'en-GB',
  { month: 'long', year: 'numeric', timeZone: 'UTC' },
)
