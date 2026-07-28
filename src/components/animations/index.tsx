'use client'

import * as React from 'react'
import {
  motion,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion'
import { forwardRef } from 'react'

export const springStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

export const springUp: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 60,
      damping: 20,
      mass: 1.2,
    },
  },
}

export const springLeft: Variants = {
  hidden: { opacity: 0, x: -24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 18,
    },
  },
}

export const springRight: Variants = {
  hidden: { opacity: 0, x: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 18,
    },
  },
}

export const springScale: Variants = {
  hidden: { opacity: 0, scale: 0.9, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 22,
    },
  },
}

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 70,
      damping: 16,
      delay: i * 0.04,
    },
  }),
}

export function AnimatedSection({
  className,
  children,
  ...props
}: HTMLMotionProps<'section'>) {
  const Component = motion.section
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={springStagger}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

export const AnimatedCard = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { index?: number }
>(({ index = 0, className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={springUp}
    custom={index}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
))
AnimatedCard.displayName = 'AnimatedCard'

export function TextReveal({
  text,
  className,
  once = true,
}: {
  text: string
  className?: string
  once?: boolean
}) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, rotateX: -15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once, margin: '-40px' }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 18,
            delay: i * 0.03,
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

export function HoverTiltCard({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>) {
  const ref = React.createRef<HTMLDivElement>()

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `
      perspective(800px)
      rotateY(${x * 8}deg)
      rotateX(${-y * 8}deg)
    `
  }

  const handleLeave = () => {
    if (!ref.current) return
    ref.current.style.transform =
      'perspective(800px) rotateY(0deg) rotateX(0deg)'
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({
  target,
  suffix = '',
  className,
}: {
  target: number
  suffix?: string
  className?: string
}) {
  const [count, setCount] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1500
          const start = performance.now()

          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }

          requestAnimationFrame(animate)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
