import type { Config } from 'tailwindcss'

// Resolves through a `--name: R G B` custom property so opacity modifiers (`bg-surface/40`) keep working under the `.light` class swap.
function withOpacity(varName: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined ? `rgb(var(${varName}))` : `rgb(var(${varName}) / ${opacityValue})`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: withOpacity('--bg'),
        surface: withOpacity('--surface'),
        'surface-2': withOpacity('--surface-2'),
        muted: withOpacity('--muted'),
        accent: withOpacity('--accent'),
        'accent-contrast': withOpacity('--accent-contrast'),
        fg: withOpacity('--fg'),
        'code-bg': withOpacity('--code-bg'),
      },
      fontFamily: {
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1040px',
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
      },
      borderColor: {
        DEFAULT: withOpacity('--border'),
        accent: withOpacity('--accent'),
      },
      borderOpacity: {
        DEFAULT: '0.07',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
