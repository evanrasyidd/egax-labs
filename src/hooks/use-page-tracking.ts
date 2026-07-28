'use client'

import { useEffect, useRef } from 'react'

export function usePageTracking(page?: string) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: page || 'dashboard' }),
    }).catch(() => {})
  }, [page])
}
