'use client'

import * as React from 'react'
import { usePathname, useRouter as useNextRouter } from 'next/navigation'

export type RouteName =
  | 'home'
  | 'about'
  | 'playground'
  | 'experiments'
  | 'dashboard'
  | 'guestbook'
  | 'contact'
  | 'links'
  | 'devlog'
  | 'manage'

const VALID_ROUTES: RouteName[] = [
  'home', 'about', 'playground', 'experiments', 'dashboard', 'guestbook', 'contact', 'links', 'devlog', 'manage',
]

export function pathToRoute(path: string): RouteName {
  const clean = path.replace(/^\//, '').split('?')[0].trim()
  if (!clean) return 'home'
  const r = clean as RouteName
  return VALID_ROUTES.includes(r) ? r : 'home'
}

export function routeToPath(route: RouteName): string {
  return route === 'home' ? '/' : `/${route}`
}

export function useRouter() {
  const pathname = usePathname()
  const nextRouter = useNextRouter()

  const route = pathToRoute(pathname)

  const navigate = React.useCallback((to: RouteName) => {
    const path = routeToPath(to)
    nextRouter.push(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [nextRouter])

  return { route, navigate }
}
