import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e14',
        surface: '#11161f',
        'surface-2': '#161c26',
        muted: '#6e7681',
        accent: '#4ade80',
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
        DEFAULT: 'rgba(255,255,255,0.07)',
        accent: '#4ade80',
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
