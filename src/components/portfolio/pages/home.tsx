'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Sparkles,
  Layers,
  Code2,
  Server,
  Smartphone,
  Database,
  Wrench,
  Coffee,
  ShoppingBag,
  Receipt,
  Building2,
  Hammer,
  BookOpen,
  Book,
  Music,
  Radio,
  Beaker,
  Box,
  GitCommit,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { skills, nowItems, featuredExperiments, blogPosts, type SkillCategory } from '@/lib/portfolio-data'
import { useRouter } from '../router'
import { SkillScatter } from '../skill-scatter'
import { TechIcon } from '../tech-icon'
import { InteractiveButton } from '@/components/ui/interactive-button'
import { TiltCard } from '@/components/ui/tilt-card'
import { useTranslation } from '@/lib/i18n/context'
import {
  AnimatedSection,
  CountUp,
  springUp,
  springStagger,
} from '@/components/animations'

type Filter = 'All' | SkillCategory

const filters: { key: Filter; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'All', icon: Layers },
  { key: 'Main', icon: Sparkles },
  { key: 'Frontend', icon: Code2 },
  { key: 'Backend', icon: Server },
  { key: 'Mobile', icon: Smartphone },
  { key: 'Database', icon: Database },
  { key: 'Tools', icon: Wrench },
]

function countByCategory(cat: Filter) {
  if (cat === 'All') return skills.length
  return skills.filter((s) => s.category === cat).length
}

const expIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  coffee: Coffee,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  'building-2': Building2,
}

const typeColor: Record<string, string> = {
  physics: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400',
  '3d': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
  creative: 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:text-pink-400',
  web: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  fullstack: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400',
  'e-commerce': 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
  pwa: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400',
}

const typeLabel: Record<string, string> = {
  physics: 'Physics',
  '3d': '3D',
  creative: 'Creative',
  web: 'Web',
  fullstack: 'Fullstack',
  'e-commerce': 'E-Commerce',
  pwa: 'PWA',
}

const nowIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hammer: Hammer,
  'book-open': BookOpen,
  book: Book,
  music: Music,
}

const nowStatusColor: Record<string, string> = {
  building: 'border-emerald-500/30 text-emerald-500',
  learning: 'border-blue-500/30 text-blue-500',
  reading: 'border-amber-500/30 text-amber-500',
  listening: 'border-purple-500/30 text-purple-500',
  active: 'border-rose-500/30 text-rose-500',
}

function FloatingTechBg() {
  const icons = React.useMemo(
    () =>
      skills.map((s, i) => ({
        ...s,
        left: 3 + (i * 11 + (s.icon.charCodeAt(0) % 7)) % 94,
        delay: 1.5 + (i % 8) * 2,
        duration: 18 + (s.icon.length % 6) * 3,
        size: i % 3 === 0 ? 28 : i % 3 === 1 ? 22 : 18,
        driftX: (s.icon.charCodeAt(1) || 0) % 50 - 25,
        rotateEnd: (s.icon.charCodeAt(2) || 0) % 20 - 10,
      })),
    []
  )

  const reduce = useReducedMotion()

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[image:radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="absolute inset-0 bg-[image:radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      {icons.map((s) => (
        <FloatingIcon key={s.icon} s={s} reduce={reduce} />
      ))}
    </div>
  )
}

function FloatingIcon({ s, reduce }: { s: (typeof skills)[number] & { left: number; delay: number; duration: number; size: number; driftX: number; rotateEnd: number }; reduce: boolean | null }) {
  const [hidden, setHidden] = React.useState(false)

  React.useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (reduce || hidden) {
    return (
      <div className="absolute" style={{ left: `${s.left}%`, bottom: '-15%', opacity: 0.12 }}>
        <div className="rounded-xl bg-background/50 p-2 shadow-sm">
          <TechIcon icon={s.icon} color={s.color ?? '#888'} size={s.size} className="text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="absolute"
      style={{ left: `${s.left}%`, bottom: '-15%', willChange: 'transform, opacity' }}
      animate={{
        y: [0, -1400],
        x: [0, s.driftX, 0],
        opacity: [0, 0.35, 0.25, 0],
        rotate: [0, s.rotateEnd, 0],
      }}
      transition={{
        duration: s.duration,
        repeat: Infinity,
        delay: s.delay,
        ease: 'linear',
      }}
    >
      <div className="rounded-xl bg-background/50 p-2 shadow-sm">
        <TechIcon icon={s.icon} color={s.color ?? '#888'} size={s.size} className="text-muted-foreground" />
      </div>
    </motion.div>
  )
}

export function HomePage({ projects = [] }: { projects?: { id: string }[] }) {
  const { t } = useTranslation()
  const { navigate } = useRouter()
  const [active, setActive] = React.useState<Filter>('All')
  const projectCount = projects.length

  return (
    <div className="py-8 sm:py-12">
      <div className="space-y-20">
        {/* Hero */}
        <section className="relative min-h-[80svh] flex items-center overflow-hidden">
          <FloatingTechBg />

          <div className="flex w-full items-center gap-12">
            <div className="max-w-xl flex-1">
              <motion.div
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 50, damping: 16, mass: 1 }}
              >
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium text-primary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  {t.home.heroTagline}
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 32, scale: 0.95, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 40, damping: 14, mass: 1.1, delay: 0.1 }}
                className="text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {t.home.heroTitle}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 45, damping: 15, delay: 0.25 }}
                className="mt-3 text-base text-muted-foreground leading-relaxed"
              >
                {t.home.heroDesc1.split('<br />').map((part, i) => i === 0 ? part : <React.Fragment key={i}><br />{part}</React.Fragment>)}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 45, damping: 15, delay: 0.35 }}
                className="mt-5 text-sm leading-relaxed text-muted-foreground"
              >
                {t.home.heroDesc2}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 45, damping: 15, delay: 0.35 }}
                className="mt-5 text-sm leading-relaxed text-muted-foreground"
              >
                {t.home.heroDesc2}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 40, damping: 14, delay: 0.5 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <InteractiveButton onClick={() => navigate('experiments')}>
                  {t.home.viewExperiments}
                </InteractiveButton>
                <InteractiveButton variant="outline" onClick={() => navigate('about')}>
                  {t.home.aboutMe}
                </InteractiveButton>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          variants={springStagger}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: 'statsProjects', value: projectCount, icon: Box },
              { key: 'statsExperiments', value: featuredExperiments.length, icon: Beaker },
              { key: 'statsDevlogs', value: blogPosts.length, icon: BookOpen },
              { key: 'statsCommits', value: 0, icon: GitCommit },
            ].map((s) => (
              <motion.div
                key={s.key}
                variants={springUp}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 p-4 text-center"
              >
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl font-bold tracking-tight">
                  <CountUp target={s.value} />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.home[s.key]}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Featured Experiments */}
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">{t.home.featuredExperiments}</h2>
            <p className="text-sm text-muted-foreground">{t.home.featuredDesc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featuredExperiments.map((exp, idx) => {
              const Icon = expIconMap[exp.icon] ?? Beaker
              return (
                <TiltCard key={exp.title} onClick={() => navigate('experiments')}>
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(6px)' }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{
                      type: 'spring',
                      stiffness: 50,
                      damping: 18,
                      mass: 1,
                      delay: idx * 0.06,
                    }}
                    className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/50 hover:shadow-glow"
                  >
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <div className="relative p-4">
                      <span className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${typeColor[exp.type] ?? 'bg-primary/10 text-primary'} transition-transform group-hover:scale-110`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold">{exp.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{exp.desc}</p>
                      <Badge variant="outline" className={`mt-2.5 border px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${typeColor[exp.type] ?? 'border-primary/30 text-primary'}`}>
                        {typeLabel[exp.type] ?? exp.type}
                      </Badge>
                    </div>
                  </motion.div>
                </TiltCard>
              )
            })}
          </div>
        </section>

        {/* Toolbox Interactive SkillScatter */}
        <AnimatedSection>
          <div className="mb-5">
            <h2 className="text-lg font-semibold tracking-tight">{t.home.toolbox}</h2>
            <p className="text-sm text-muted-foreground">{t.home.toolboxDesc}</p>
          </div>

          <motion.div variants={springUp} className="mb-3 flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/60 text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                }`}
              >
                <f.icon className="h-3.5 w-3.5" />
                <span>{f.key}</span>
                <span className="ml-0.5 rounded-full bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {countByCategory(f.key)}
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div variants={springUp}>
            <SkillScatter activeCategory={active === 'All' ? null : active} />
          </motion.div>
        </AnimatedSection>

        {/* Lab Activity */}
        <AnimatedSection>
          <div className="mb-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t.home.labActivity}
            </h2>
            <p className="text-sm text-muted-foreground">{t.home.labActivityDesc}</p>
          </div>

          <div className="divide-y divide-border/40 rounded-xl border border-border/60 bg-card">
            {nowItems.map((item, idx) => {
              const Icon = nowIconMap[item.icon] ?? Sparkles
              const tr = t.home.nowItems?.[item.status]
              return (
                <motion.div
                  key={item.label}
                  custom={idx}
                  initial={{ opacity: 0, x: -20, filter: 'blur(3px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{
                    type: 'spring',
                    stiffness: 50,
                    damping: 16,
                    delay: idx * 0.04,
                  }}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${nowStatusColor[item.status] ?? 'border-primary/30 text-primary'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{tr?.label ?? item.label}</p>
                    <p className="text-sm font-medium leading-tight">{tr?.value ?? item.value}</p>
                    {item.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground/70">{tr?.detail ?? item.detail}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={`shrink-0 border px-2 py-0.5 text-[9px] uppercase tracking-wide ${nowStatusColor[item.status] ?? ''}`}>
                    {item.status}
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
