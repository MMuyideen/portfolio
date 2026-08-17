import type { ProjectFlow } from '../data/portfolio'

/**
 * A fan-out diagram drawn in DOM rather than ASCII.
 *
 * The two strongest projects ship no diagram in their repository, and the old
 * fallback listed the stack in boxes — which told a visitor nothing the chips
 * below did not. This draws the one relationship that matters: what talks to
 * what. Boxes and rules only, so it wraps instead of overflowing on a phone
 * the way preformatted art would.
 */
export function ProjectFlowDiagram({ flow, label }: { flow: ProjectFlow; label: string }) {
  return (
    <figure
      className="flex h-full w-full flex-col items-center justify-center gap-0 p-8 font-mono text-xs"
      aria-label={diagramSummary(flow, label)}
    >
      <div aria-hidden="true" className="flex w-full flex-col items-center">
        <Node emphasis>{flow.source}</Node>

        <Edge label={flow.edge} />

        {flow.via && (
          <>
            <Node emphasis>{flow.via}</Node>
            <Edge />
          </>
        )}

        {/* Split bar: one horizontal rule, one stub down into each target. */}
        <div className="h-px w-2/3 max-w-[15rem] bg-accent/25" />

        <div className="flex flex-wrap items-start justify-center gap-2">
          {flow.targets.map(target => (
            <div key={target} className="flex flex-col items-center">
              <div className="h-5 w-px bg-accent/25" />
              <Node>{target}</Node>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-8 text-[10px] uppercase tracking-widest text-muted">
        {label}
      </figcaption>
    </figure>
  )
}

function Node({ children, emphasis }: { children: string; emphasis?: boolean }) {
  return (
    <span
      className={
        'rounded border bg-[rgb(var(--code-bg))] px-3 py-1.5 text-center ' +
        (emphasis
          ? 'border-accent/40 text-accent'
          : 'border-[rgb(var(--border)/0.12)] text-muted')
      }
    >
      {children}
    </span>
  )
}

/** The vertical run between two stages, with its label sitting on the line. */
function Edge({ label }: { label?: string }) {
  if (!label) return <div className="h-8 w-px bg-accent/25" />
  return (
    <div className="flex flex-col items-center">
      <div className="h-4 w-px bg-accent/25" />
      <span className="my-1 text-[10px] uppercase tracking-widest text-accent/70">
        {label}
      </span>
      <div className="h-4 w-px bg-accent/25" />
    </div>
  )
}

/** The same diagram as one sentence, for anyone not reading the boxes. */
function diagramSummary(flow: ProjectFlow, label: string): string {
  const via = flow.via ? ` through ${flow.via}` : ''
  const edge = flow.edge ? ` over ${flow.edge}` : ''
  return `${label}: ${flow.source}${edge}${via}, out to ${flow.targets.join(', ')}`
}
