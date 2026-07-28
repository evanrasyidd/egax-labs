'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type InteractiveButtonProps = {
  children: React.ReactNode
  icon?: LucideIcon
  variant?: 'primary' | 'outline'
  onClick?: () => void
  className?: string
}

export function InteractiveButton({
  children,
  icon: Icon = ArrowRight,
  variant = 'primary',
  onClick,
  className,
}: InteractiveButtonProps) {
  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={cn(
        'group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full px-5 text-sm font-medium',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'border border-border/60 bg-transparent text-foreground',
        className
      )}
    >
      <motion.span
        className="relative z-10 flex items-center gap-2"
        initial={false}
      >
        <span>{children}</span>
        <motion.span
          className="inline-flex"
          variants={{
            rest: { x: 0, opacity: 1 },
            hover: { x: 4, opacity: 1 },
          }}
          initial="rest"
          whileHover="hover"
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Icon className="h-3.5 w-3.5" />
        </motion.span>
      </motion.span>
      <motion.span
        className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
        variants={{
          rest: { x: '-120%' },
          hover: { x: '120%' },
        }}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {variant === 'outline' && (
        <motion.span
          className="absolute inset-0 -z-10 rounded-full bg-accent/60"
          variants={{
            rest: { opacity: 0, scale: 0.85 },
            hover: { opacity: 1, scale: 1 },
          }}
          initial="rest"
          whileHover="hover"
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}
    </motion.button>
  )
}
