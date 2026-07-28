'use client'

import { useTranslation } from '@/lib/i18n/context'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation()

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
      className="flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      aria-label={locale === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
    >
      <Languages className="h-3 w-3" />
      {locale === 'en' ? 'ID' : 'EN'}
    </button>
  )
}
