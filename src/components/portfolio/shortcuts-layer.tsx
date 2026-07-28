'use client'

import * as React from 'react'
import { useRouter } from './router'
import { useTheme, type ThemeName } from './theme-provider'
import { ShortcutsHelp, useShortcutsHelp } from './shortcuts-help'

const themeOrder: ThemeName[] = ['dark', 'light', 'valentine']

/**
 * Global keyboard shortcuts handler + shortcuts help overlay.
 * Renders nothing visible except the overlay dialog.
 */
export function ShortcutsLayer() {
  const { navigate } = useRouter()
  const { theme, setTheme } = useTheme()

  const cycleTheme = React.useCallback(() => {
    const idx = themeOrder.indexOf(theme)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }, [theme, setTheme])

  const scrollTop = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const navigateStr = React.useCallback((route: string) => {
    navigate(route as never)
    scrollTop()
  }, [navigate, scrollTop])

  const { helpOpen, setHelpOpen } = useShortcutsHelp(navigateStr, cycleTheme, scrollTop)

  // Allow other components (e.g. sidebar button) to open the help
  React.useEffect(() => {
    const openHelp = () => setHelpOpen(true)
    window.addEventListener('portfolio:open-shortcuts', openHelp)
    return () => window.removeEventListener('portfolio:open-shortcuts', openHelp)
  }, [setHelpOpen])

  return <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
}
