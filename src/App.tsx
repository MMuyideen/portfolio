import { useState, useEffect } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Experience } from './components/Experience'
import { Education } from './components/Education'
import { TechStack } from './components/TechStack'
import { Certifications } from './components/Certifications'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { CommandPalette } from './components/CommandPalette'
import { portfolio } from './data/portfolio'

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-bg focus:font-mono focus:text-sm focus:rounded"
      >
        Skip to content
      </a>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <main id="main-content">
        <Hero />
        <Projects projects={portfolio.projects} />
        <Experience experience={portfolio.experience} />
        <Education education={portfolio.education} />
        <TechStack skills={portfolio.skills} />
        <Certifications certifications={portfolio.certifications} />
        <Contact
          email={portfolio.email}
          github={portfolio.github}
          linkedin={portfolio.linkedin}
        />
      </main>
      <Footer name={portfolio.name} />
    </>
  )
}
