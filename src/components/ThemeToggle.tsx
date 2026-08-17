import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={isLight}
      className={
        'inline-flex items-center justify-center h-8 w-8 rounded border text-muted hover:text-fg hover:border-[rgb(var(--border)/0.2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shrink-0 ' +
        className
      }
    >
      {isLight ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
    </button>
  )
}
