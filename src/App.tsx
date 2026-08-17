import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import { EASE } from './lib/motion'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { portfolio } from './data/portfolio'

// Blog routes are code-split so the home route ships without them.
const BlogIndex = lazy(() =>
  import('./pages/BlogIndex').then(m => ({ default: m.BlogIndex })),
)
const BlogPost = lazy(() =>
  import('./pages/BlogPost').then(m => ({ default: m.BlogPost })),
)
const Resume = lazy(() =>
  import('./pages/Resume').then(m => ({ default: m.Resume })),
)
// cmdk + Radix Dialog are only needed once someone reaches for ⌘K, so they stay
// out of the initial bundle. Mounted on first open and kept mounted after, so
// the dialog keeps its enter/exit animations.
const CommandPalette = lazy(() =>
  import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })),
)

function RouteFallback() {
  return (
    <div className="max-w-content mx-auto px-6 pt-32 pb-24">
      <p className="font-mono text-sm text-muted" aria-live="polite">
        Loading…
      </p>
    </div>
  )
}

/**
 * On route change, scroll to the top. If the URL carries a hash (e.g. arriving
 * at "/#projects" from another route), scroll that section into view instead,
 * waiting a frame for the target to mount.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      const raf = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView()
      })
      return () => cancelAnimationFrame(raf)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteMounted, setPaletteMounted] = useState(false)
  const location = useLocation()

  // Opening is what pulls the palette chunk in; it stays mounted from then on.
  const openPalette = useCallback(() => {
    setPaletteMounted(true)
    setPaletteOpen(true)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteMounted(true)
        setPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    // The CSS reduced-motion kill-switch doesn't reach Framer Motion's
    // JS-driven transforms, so honor the OS preference here as well.
    <MotionConfig reducedMotion="user">
      {/* Ambient phosphor light source at the top of the page. First in the
          DOM so every sibling paints above it; pointer-events off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[480px] bg-[radial-gradient(640px_320px_at_50%_-100px,rgba(74,222,128,0.09),transparent_70%)]"
      />
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-contrast focus:font-mono focus:text-sm focus:rounded"
      >
        Skip to content
      </a>
      <Nav onOpenPalette={openPalette} />
      {paletteMounted && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </Suspense>
      )}
      <main id="main-content">
        {/* Route transitions: quick crossfade + drift so page changes feel
            engineered rather than hard-cut. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            <Suspense fallback={<RouteFallback />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<BlogIndex />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/resume" element={<Resume />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer name={portfolio.name} />
    </MotionConfig>
  )
}
