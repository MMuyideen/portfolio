/**
 * The MM monogram, as geometry.
 *
 * One copy of the path data for every build script that draws the mark, so a
 * generated asset can never disagree with src/components/Monogram.tsx or
 * public/brand/mm-mark-*.svg. Straight from the brand artifact:
 *
 *   grid        390 × 325, expressed as viewBox "-14 -14 418 353" so the
 *               28-wide stroke is not clipped at the edges
 *   stroke      28, constant, no tapering
 *   joins       mitre, miterlimit 10 — sharp terminals
 *   counter     the inner diamond stays closed; below ~20px it fills in, which
 *               is the mark's minimum legible size on its own
 *   colour      one flat colour, never a gradient, never outlined
 */

export const PATHS = [
  'M14 325 V14 L127 91',
  'M376 325 V14 L263 91',
  'M85 325 V121 L196 208 L307 121 V325',
  'M148 179 L196 139 L244 179',
]

export const VIEW_BOX = '-14 -14 418 353'

/** Aspect ratio of the mark's box — width ÷ height. */
export const ASPECT = 418 / 353

/** The mark as standalone SVG markup, stroked in `color`. */
export function markSvg(color) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="418" height="353">`,
    `  <g fill="none" stroke="${color}" stroke-width="28" stroke-linejoin="miter" stroke-miterlimit="10">`,
    ...PATHS.map(d => `    <path d="${d}"/>`),
    '  </g>',
    '</svg>',
  ].join('\n')
}

/** The mark as an inline SVG fragment, for embedding in a rendered page. */
export function markFragment({ color = 'currentColor', style = '' } = {}) {
  return [
    `<svg viewBox="${VIEW_BOX}" style="${style}" fill="none" stroke="${color}"`,
    ' stroke-width="28" stroke-linejoin="miter" stroke-miterlimit="10">',
    ...PATHS.map(d => `<path d="${d}"/>`),
    '</svg>',
  ].join('')
}
