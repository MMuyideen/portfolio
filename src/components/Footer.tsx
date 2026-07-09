export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t py-6 px-6">
      <div className="max-w-content mx-auto flex flex-wrap items-center justify-between gap-y-2 font-mono text-xs text-muted">
        <span>© {new Date().getFullYear()} {name}</span>
        {/* Build stamp: proof the pipeline ran, straight from git. */}
        <span className="inline-flex items-center gap-2 select-none">
          <span>
            <span className="text-accent">$</span> git rev-parse --short HEAD
          </span>
          <span className="text-white">{__COMMIT_HASH__}</span>
          <span
            aria-hidden="true"
            className="inline-block w-[0.5ch] h-[0.85em] bg-muted/30 align-text-bottom animate-blink motion-reduce:animate-none"
          />
        </span>
      </div>
    </footer>
  )
}
