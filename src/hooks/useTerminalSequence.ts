import { useState, useEffect, useRef } from 'react'

export interface TerminalStep {
  kind: 'prompt' | 'output'
  text: string
}

export interface TerminalState {
  completedLines: TerminalStep[]
  currentText: string
  currentKind: 'output' | null
  idle: boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useTerminalSequence(
  steps: readonly TerminalStep[],
  typingSpeed = 40,
  advanceDelay = 500,
): TerminalState {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const [state, setState] = useState<TerminalState>(() =>
    prefersReducedMotion.current
      ? { completedLines: [...steps], currentText: '', currentKind: null, idle: true }
      : { completedLines: [], currentText: '', currentKind: null, idle: false },
  )

  useEffect(() => {
    if (prefersReducedMotion.current) return

    let cancelled = false
    setState({ completedLines: [], currentText: '', currentKind: null, idle: false })

    async function run() {
      for (const step of steps) {
        if (cancelled) return

        if (step.kind === 'prompt') {
          setState(s => ({ ...s, completedLines: [...s.completedLines, step] }))
          await sleep(advanceDelay)
        } else {
          setState(s => ({ ...s, currentKind: 'output', currentText: '' }))
          for (let i = 1; i <= step.text.length; i++) {
            if (cancelled) return
            const partial = step.text.slice(0, i)
            setState(s => ({ ...s, currentText: partial }))
            await sleep(typingSpeed)
          }
          await sleep(300)
          setState(s => ({
            ...s,
            completedLines: [...s.completedLines, step],
            currentText: '',
            currentKind: null,
          }))
          await sleep(advanceDelay)
        }
      }
      if (!cancelled) setState(s => ({ ...s, idle: true }))
    }

    run()
    return () => { cancelled = true }
  }, []) // animation fires once on mount

  return state
}
