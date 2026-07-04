import { Terminal, BookOpen } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface NavProps {
  onOpenPalette: () => void
}

const NAV_LINKS = [
  { label: 'Projects', id: 'projects' },
  { label: 'Experience', id: 'experience' },
  { label: 'Education', id: 'education' },
  { label: 'Tech Stack', id: 'tech-stack' },
  { label: 'Certifications', id: 'certifications' },
  { label: 'Contact', id: 'contact' },
]

export function Nav({ onOpenPalette }: NavProps) {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  // On the home route these are in-page anchors; elsewhere they route home first.
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  return (
    <header className="sticky top-0 z-40 border-b bg-bg/95 backdrop-blur-sm">
      <div className="max-w-content mx-auto px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-accent flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
          aria-label="Muyideen Morenigbade — home"
        >
          <Terminal size={15} aria-hidden="true" />
          <span>MM</span>
        </Link>

        {/* Section links */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Page sections">
          {NAV_LINKS.map(link => (
            <a
              key={link.id}
              href={sectionHref(link.id)}
              className="font-mono text-xs text-muted hover:text-white transition-colors px-2.5 py-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent/80 transition-colors px-2.5 py-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ml-1"
          >
            <BookOpen size={11} aria-hidden="true" />
            Blog
          </Link>
        </nav>

        {/* ⌘K */}
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+k Control+k"
          className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-xs text-muted hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
        >
          <span className="hidden sm:inline">Search</span>
          <kbd className="text-[10px] opacity-60 not-italic" aria-hidden="true">⌘K</kbd>
        </button>
      </div>
    </header>
  )
}
