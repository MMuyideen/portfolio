export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t py-6 px-6">
      <div className="max-w-content mx-auto flex items-center justify-between font-mono text-xs text-muted">
        <span>© {new Date().getFullYear()} {name}</span>
        <span aria-hidden="true" className="select-none">
          {'$ '}
          <span className="inline-block w-[0.5ch] h-[0.85em] bg-muted/30 align-text-bottom" />
        </span>
      </div>
    </footer>
  )
}
