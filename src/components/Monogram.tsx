/**
 * The MM monogram — two Ms sharing a closed diamond counter.
 *
 * Geometry is the brand artifact's exactly: 4 paths on a 390×325 grid with a
 * constant 28 stroke and mitre joins (public/brand/mm-mark-*.svg is the same
 * path data). Stroked in `currentColor` so it takes the colour of whatever it
 * sits in — the brand rule is one flat colour, never a gradient, never
 * outlined.
 *
 * Minimum legible size is 20px; below that the diamond counter fills in.
 */
export function Monogram({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="-14 -14 418 353"
      width={size}
      height={(size * 353) / 418}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={28}
      strokeLinejoin="miter"
      strokeMiterlimit={10}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 325 V14 L127 91" />
      <path d="M376 325 V14 L263 91" />
      <path d="M85 325 V121 L196 208 L307 121 V325" />
      <path d="M148 179 L196 139 L244 179" />
    </svg>
  )
}
