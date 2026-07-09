/**
 * Shared motion vocabulary. One exponential ease-out and one viewport config
 * so scroll reveals land consistently; per-surface variants differ in shape
 * (rise, slide, grow) rather than each component reinventing timing.
 */

/** Exponential ease-out (quint): fast start, soft landing. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Scroll-reveal trigger config shared by every whileInView animation. */
export const VIEWPORT = { once: true, margin: '-80px' } as const

/** Rise-and-fade reveal for blocks. */
export function fadeUp(delay = 0, distance = 20) {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.55, ease: EASE, delay },
  }
}

/** Horizontal slide reveal (project rows alternate direction). */
export function slideIn(fromLeft: boolean, delay = 0) {
  return {
    initial: { opacity: 0, x: fromLeft ? -24 : 24 },
    whileInView: { opacity: 1, x: 0 },
    viewport: VIEWPORT,
    transition: { duration: 0.6, ease: EASE, delay },
  }
}
