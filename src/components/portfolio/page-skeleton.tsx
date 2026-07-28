'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

/**
 * Animated skeleton placeholder shown briefly during page transitions.
 * Renders a shimmer effect with realistic content blocks.
 */
export function PageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="py-8 sm:py-12"
      aria-hidden
    >
      {/* Title skeleton */}
      <div className="mb-2 h-9 w-48 animate-pulse rounded-lg bg-muted/50" />
      <div className="mb-8 h-4 w-72 animate-pulse rounded bg-muted/40" />

      {/* Content blocks */}
      <div className="space-y-4">
        <div className="h-32 w-full animate-pulse rounded-xl bg-muted/30" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-muted/30"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
        <div className="h-48 w-full animate-pulse rounded-xl bg-muted/25" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-muted/30"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
