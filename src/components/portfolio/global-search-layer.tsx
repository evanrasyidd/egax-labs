'use client'

import * as React from 'react'
import { useRouter } from './router'
import { GlobalSearch } from './global-search'

/**
 * Global search layer handles keyboard shortcut (Cmd/Ctrl+/) and renders the search modal.
 */
export function GlobalSearchLayer() {
  const { navigate } = useRouter()
  const [open, setOpen] = React.useState(false)

  // Keyboard shortcut: Cmd/Ctrl + /
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Listen for custom event from sidebar button
  React.useEffect(() => {
    const openSearch = () => setOpen(true)
    window.addEventListener('portfolio:open-search', openSearch)
    return () => window.removeEventListener('portfolio:open-search', openSearch)
  }, [])

  const handleNavigate = React.useCallback((route: string) => {
    navigate(route as never)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  return <GlobalSearch open={open} onOpenChange={setOpen} onNavigate={handleNavigate} />
}
