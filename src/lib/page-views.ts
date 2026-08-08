'use client'

import * as React from 'react'

/**
 * Tracks page views in localStorage.
 * Call usePageViews() at the app root it listens to hash changes and increments
 * view counts per route.
 */

const STORAGE_KEY = 'portfolio-page-views'
const SESSION_KEY = 'portfolio-session-start'

export interface PageViewData {
  totalViews: number
  perRoute: Record<string, number>
  lastVisit: string
  sessionStart: string
}

function readData(): PageViewData {
  if (typeof window === 'undefined') {
    return { totalViews: 0, perRoute: {}, lastVisit: '', sessionStart: '' }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const sessionStart = new Date().toISOString()
      const data: PageViewData = { totalViews: 0, perRoute: {}, lastVisit: sessionStart, sessionStart }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(SESSION_KEY, sessionStart)
      return data
    }
    return JSON.parse(raw) as PageViewData
  } catch {
    return { totalViews: 0, perRoute: {}, lastVisit: '', sessionStart: '' }
  }
}

function writeData(data: PageViewData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

/** Increment view count for a route (called on route change) */
export function trackView(route: string) {
  if (typeof window === 'undefined') return
  const data = readData()
  data.totalViews += 1
  data.perRoute[route] = (data.perRoute[route] ?? 0) + 1
  data.lastVisit = new Date().toISOString()
  writeData(data)
}

/** Get current view data (client-side only) */
export function getViews(): PageViewData {
  return readData()
}

/** Hook that tracks views on route change. Call once at app root. */
export function usePageViewTracker(route: string) {
  React.useEffect(() => {
    trackView(route)
  }, [route])
}
