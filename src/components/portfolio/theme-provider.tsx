'use client'

import * as React from 'react'

export type ThemeName = 'dark' | 'light' | 'valentine'

interface ThemeCtx {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}

const ThemeContext = React.createContext<ThemeCtx>({
  theme: 'dark',
  setTheme: () => {},
})

const STORAGE_KEY = 'portfolio-theme'

function applyTheme(theme: ThemeName) {
  const html = document.documentElement
  // Remove all theme classes
  html.classList.remove('dark', 'light', 'valentine')
  html.classList.add(theme)
  html.style.colorScheme = theme === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>('dark')

  React.useEffect(() => {
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEY) as ThemeName | null)
      : null)
    const initial = stored || 'dark'
    applyTheme(initial)
    setThemeState(initial)
  }, [])

  const setTheme = React.useCallback((t: ThemeName) => {
    applyTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
    setThemeState(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}
