'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, type RouteName } from './router'
import { trackView } from '@/lib/page-views'
import { PageSkeleton } from './page-skeleton'
import { ErrorBoundary } from '@/components/error-boundary'

const routeOrder: RouteName[] = [
  'home', 'about', 'playground', 'experiments', 'dashboard', 'devlog', 'guestbook', 'contact', 'links', 'manage',
]

/**
 * Renders only the child matching the current route.
 * Children order must match `routeOrder`.
 * Shows a brief skeleton during route transitions.
 */
export function RouterView({ children }: { children: React.ReactNode }) {
  const { route } = useRouter()
  const childArray = React.Children.toArray(children)
  const idx = routeOrder.indexOf(route)
  const safeIdx = idx === -1 ? 0 : idx
  const current = childArray[safeIdx] ?? childArray[0]

  const [isLoading, setIsLoading] = React.useState(false)
  const [displayedRoute, setDisplayedRoute] = React.useState(route)

  // Track page view on route change + show brief skeleton
  React.useEffect(() => {
    if (route !== displayedRoute) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setDisplayedRoute(route)
        setIsLoading(false)
        trackView(route)
      }, 180)
      return () => clearTimeout(timer)
    }
    trackView(route)
  }, [route, displayedRoute])

  // Render the displayed route's content (not the current route during transition)
  const displayedIdx = routeOrder.indexOf(displayedRoute)
  const displayedSafeIdx = displayedIdx === -1 ? 0 : displayedIdx
  const displayedChild = childArray[displayedSafeIdx] ?? childArray[0]

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <PageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key={displayedRoute}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ErrorBoundary>{displayedChild}</ErrorBoundary>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
