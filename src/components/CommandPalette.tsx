import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { ArrowRight, BookOpen, Linkedin, Mail, Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { GitHubIcon } from './GitHubIcon'
import { portfolio } from '../data/portfolio'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NAV_ITEMS = [
  { label: 'Hero', href: '#main-content' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function select(href: string) {
    onOpenChange(false)
    if (href.startsWith('#')) {
      const id = href.slice(1)
      if (pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate(`/#${id}`)
      }
    } else if (href.startsWith('/')) {
      navigate(href)
    } else {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/75 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-[18vh] z-50 w-full max-w-md -translate-x-1/2 px-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4 duration-150"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <Command
            key={String(open)}
            className="bg-surface border rounded overflow-hidden shadow-2xl font-mono text-sm"
          >
            <div className="flex items-center gap-2.5 px-4 border-b">
              <Search size={13} className="text-muted shrink-0" aria-hidden="true" />
              <Command.Input
                placeholder="Jump to section or link..."
                className="w-full py-3.5 bg-transparent text-sm placeholder:text-muted focus:outline-none"
              />
            </div>

            <Command.List className="max-h-64 overflow-y-auto py-1.5">
              <Command.Empty className="py-8 text-center text-muted text-xs">
                No results.
              </Command.Empty>

              <Command.Group heading="Navigate">
                {NAV_ITEMS.map(item => (
                  <Command.Item
                    key={item.href}
                    value={item.label}
                    onSelect={() => select(item.href)}
                    className="flex items-center gap-3 px-4 py-2 cursor-pointer text-muted aria-selected:bg-surface-2 aria-selected:text-white transition-colors"
                  >
                    <ArrowRight size={11} className="text-accent shrink-0" aria-hidden="true" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Links">
                <Command.Item
                  value="Blog"
                  onSelect={() => select('/blog')}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-muted aria-selected:bg-surface-2 aria-selected:text-white transition-colors"
                >
                  <BookOpen size={11} className="shrink-0" aria-hidden="true" />
                  Blog
                </Command.Item>
                <Command.Item
                  value="GitHub"
                  onSelect={() => select(portfolio.github)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-muted aria-selected:bg-surface-2 aria-selected:text-white transition-colors"
                >
                  <GitHubIcon size={11} className="shrink-0" aria-hidden="true" />
                  GitHub
                </Command.Item>
                <Command.Item
                  value="LinkedIn"
                  onSelect={() => select(portfolio.linkedin)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-muted aria-selected:bg-surface-2 aria-selected:text-white transition-colors"
                >
                  <Linkedin size={11} className="shrink-0" aria-hidden="true" />
                  LinkedIn
                </Command.Item>
                <Command.Item
                  value="Email"
                  onSelect={() => select(`mailto:${portfolio.email}`)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-muted aria-selected:bg-surface-2 aria-selected:text-white transition-colors"
                >
                  <Mail size={11} className="shrink-0" aria-hidden="true" />
                  Email
                </Command.Item>
              </Command.Group>
            </Command.List>

            <div className="flex items-center gap-4 px-4 py-2 border-t text-[10px] text-muted select-none">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">esc close</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
