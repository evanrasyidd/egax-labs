'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type TiltCardProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function TiltCard({ children, className, onClick }: TiltCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 200, damping: 25 })
  const springY = useSpring(y, { stiffness: 200, damping: 25 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px)
    y.set(py)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  const Tag = onClick ? 'button' : 'div'

  return (
    <motion.div
      style={{ perspective: 800, rotateX, rotateY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={onClick ? 'block text-left' : ''}
    >
      <Tag
        onClick={onClick}
        className={className}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </Tag>
    </motion.div>
  )
}
