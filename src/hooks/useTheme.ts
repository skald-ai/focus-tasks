import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { readPref, writePref } from '../state/storage'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'focus-tasks:theme'
const THEME_COLOR: Record<Theme, string> = { light: '#fdfbf7', dark: '#161513' }

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}

function hasExplicitChoice(): boolean {
  const saved = readPref(THEME_KEY)
  return saved === 'light' || saved === 'dark'
}

export function useTheme() {
  // Начальное значение уже выставлено скриптом в index.html до первой отрисовки
  const [theme, setTheme] = useState<Theme>(currentTheme)

  /** origin — центр кнопки: из этой точки новая тема раскрывается кругом. */
  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark'
      writePref(THEME_KEY, next)

      const commit = () => {
        flushSync(() => setTheme(next))
        applyTheme(next)
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!origin || reduceMotion || !('startViewTransition' in document)) {
        commit()
        return
      }

      const radius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      )
      const root = document.documentElement
      root.style.setProperty('--reveal-x', `${origin.x}px`)
      root.style.setProperty('--reveal-y', `${origin.y}px`)
      root.style.setProperty('--reveal-r', `${radius}px`)
      document.startViewTransition(commit)
    },
    [theme],
  )

  // Пока человек не выбрал тему сам, следуем за системной
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (hasExplicitChoice()) return
      const next: Theme = event.matches ? 'dark' : 'light'
      setTheme(next)
      applyTheme(next)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return { theme, toggle }
}
