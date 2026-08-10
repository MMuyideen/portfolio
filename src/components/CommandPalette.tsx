import { useCallback, useEffect, useState } from 'react'
import { Command } from 'cmdk'
import {
  ArrowUpRight,
  Copy,
  Download,
  FileText,
  Home,
  Mail,
  Rss,
} from 'lucide-react'

const EMAIL = 'contact@muyideen.dev'

interface Props {
  posts: Array<{ slug: string; title: string }>
}

const SECTIONS = [
  { label: 'Work', href: '/#work' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Writing', href: '/#writing' },
  { label: 'Credentials', href: '/#credentials' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Blog', href: '/blog' },
  { label: 'Résumé', href: '/resume' },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/mmuyideen' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/muyideenmorenigbade' },
]

const ITEM_CLASS =
  'flex cursor-pointer select-none items-center gap-3 rounded px-3 py-2 text-sm text-fg data-[selected=true]:bg-panel-2 data-[selected=true]:text-white'

export default function CommandPalette({ posts }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('palette:open', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('palette:open', onOpen)
    }
  }, [])

  const go = useCallback((href: string) => {
    setOpen(false)
    window.location.href = href
  }, [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      /* clipboard unavailable */
    }
    setOpen(false)
  }, [])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed left-1/2 top-[18vh] z-50 w-[min(92vw,560px)] -translate-x-1/2 overflow-hidden rounded-lg border border-white/10 bg-panel shadow-2xl"
      overlayClassName="fixed inset-0 z-50 bg-black/60"
    >
      <Command.Input
        placeholder="Type a command or search…"
        className="w-full border-b border-line bg-transparent px-4 py-3.5 font-mono text-sm text-white outline-none placeholder:text-muted"
      />
      <Command.List className="max-h-[50vh] overflow-y-auto p-2 pb-3">
        <Command.Empty className="px-4 py-8 text-center font-mono text-sm text-muted">
          No results.
        </Command.Empty>

        <Command.Group heading="Go to">
          {SECTIONS.map(section => (
            <Command.Item
              key={section.href}
              onSelect={() => go(section.href)}
              className={ITEM_CLASS}
            >
              <Home size={14} aria-hidden="true" />
              {section.label}
            </Command.Item>
          ))}
        </Command.Group>

        {posts.length > 0 && (
          <Command.Group heading="Writing">
            {posts.map(post => (
              <Command.Item
                key={post.slug}
                onSelect={() => go(`/blog/${post.slug}`)}
                className={ITEM_CLASS}
              >
                <FileText size={14} aria-hidden="true" />
                <span className="truncate">{post.title}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Actions">
          <Command.Item onSelect={copyEmail} className={ITEM_CLASS}>
            <Copy size={14} aria-hidden="true" />
            Copy email address
          </Command.Item>
          <Command.Item
            onSelect={() => go(`mailto:${EMAIL}`)}
            className={ITEM_CLASS}
          >
            <Mail size={14} aria-hidden="true" />
            Email me
          </Command.Item>
          <Command.Item
            onSelect={() => go('/resume.pdf')}
            className={ITEM_CLASS}
          >
            <Download size={14} aria-hidden="true" />
            Download résumé (PDF)
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Elsewhere">
          {LINKS.map(link => (
            <Command.Item
              key={link.href}
              onSelect={() => go(link.href)}
              className={ITEM_CLASS}
            >
              <ArrowUpRight size={14} aria-hidden="true" />
              {link.label}
            </Command.Item>
          ))}
          <Command.Item onSelect={() => go('/rss.xml')} className={ITEM_CLASS}>
            <Rss size={14} aria-hidden="true" />
            RSS feed
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
