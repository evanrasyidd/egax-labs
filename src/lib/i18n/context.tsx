'use client'

import * as React from 'react'
import type { Dict, Locale } from './types'
import en from './en'
import id from './id'

type I18nContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dict
}

const I18nContext = React.createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'portfolio-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'id'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'id') return stored
  return 'id'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>('id')
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setLocaleState(getInitialLocale())
    setReady(true)
  }, [])

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  const dict = locale === 'en' ? en : id

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dict }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
export type { Dict, Locale }

