import { Monogram } from './Monogram'

export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t py-6 px-6">
      <div className="max-w-content mx-auto flex flex-wrap items-center justify-between gap-y-2 font-mono text-xs text-muted">
        {/* Sign-off. The nav opens the page with the mark; this closes it. At
            20px it is exactly the brand's minimum legible size — any smaller
            and the diamond counter fills in. */}
        <span className="inline-flex items-center gap-2.5">
          <Monogram size={20} className="text-muted/80" />
          <span>© {new Date().getFullYear()} {name}</span>
        </span>
        {/* Build stamp: proof the pipeline ran, straight from git. */}
        <span className="inline-flex items-center gap-2 select-none">
          <span>
            <span className="text-accent">$</span> git rev-parse --short HEAD
          </span>
          <span className="text-fg">{__COMMIT_HASH__}</span>
          <span
            aria-hidden="true"
            className="inline-block w-[0.5ch] h-[0.85em] bg-muted/30 align-text-bottom animate-blink motion-reduce:animate-none"
          />
        </span>
      </div>
    </footer>
  )
}
