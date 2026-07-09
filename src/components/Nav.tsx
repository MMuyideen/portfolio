import { useEffect, useState } from 'react'
import { Terminal, BookOpen, Menu, X } from 'lucide-react'
import { motion, useScroll } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

interface NavProps {
  onOpenPalette: () => void
}

/** Order mirrors the home page sections. */
const NAV_LINKS = [
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Tech Stack', id: 'tech-stack' },
  { label: 'Certifications', id: 'certifications' },
  { label: 'Education', id: 'education' },
  { label: 'Contact', id: 'contact' },
]

/**
 * Highlight the last section whose top has passed the upper 40% of the
 * viewport. Position-based (not IntersectionObserver) so the highlight never
 * goes stale in the gaps between nav sections or at the bottom of the page.
 */
function useActiveSection(enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const threshold = window.innerHeight * 0.4
      let current: string | null = null
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id)
        if (el && el.getBoundingClientRect().top <= threshold) current = link.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enabled])

  return active
}

export function Nav({ onOpenPalette }: NavProps) {
  const { pathname } = useLocation()
  const { scrollYProgress } = useScroll()
  const [menuOpen, setMenuOpen] = useState(false)
  const onHome = pathname === '/'
  const active = useActiveSection(onHome)
  // On the home route these are in-page anchors; elsewhere they route home first.
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/#${id}`)

  // Close the mobile menu when navigating to another route.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b bg-bg/95 backdrop-blur-sm">
      {/* Reading progress: a hairline of accent tracking scroll position. */}
      <motion.div
        className="absolute bottom-[-1px] left-0 right-0 h-px bg-accent origin-left"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
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

        {/* Section links (desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Page sections">
          {NAV_LINKS.map(link => (
            <a
              key={link.id}
              href={sectionHref(link.id)}
              aria-current={active === link.id ? 'true' : undefined}
              className={
                'font-mono text-xs transition-colors px-2.5 py-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ' +
                (active === link.id ? 'text-accent' : 'text-muted hover:text-white')
              }
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

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded border text-muted hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0"
        >
          {menuOpen ? <X size={15} aria-hidden="true" /> : <Menu size={15} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <motion.nav
          aria-label="Page sections"
          className="lg:hidden absolute top-full inset-x-0 border-b bg-bg/95 backdrop-blur-sm"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="max-w-content mx-auto px-6 py-3 flex flex-col">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={sectionHref(link.id)}
                onClick={() => setMenuOpen(false)}
                className={
                  'font-mono text-sm py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ' +
                  (active === link.id ? 'text-accent' : 'text-muted hover:text-white')
                }
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/blog"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 font-mono text-sm text-accent py-2.5 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <BookOpen size={13} aria-hidden="true" />
              Blog
            </Link>
          </div>
        </motion.nav>
      )}
    </header>
  )
}
