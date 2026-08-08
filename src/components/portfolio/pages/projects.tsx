'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Github, ArrowUpRight, ArrowLeft, X, Tag, Coffee, ShoppingBag, Receipt, Building2, User, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '../page-header'
import { useTranslation } from '@/lib/i18n/context'

const projectIcon: Record<string, LucideIcon> = {
  'rasga-coffee-studio': Coffee,
  'egax-studios': ShoppingBag,
  'invoicegua': Receipt,
  'egalog': Building2,
  'egaxdev': User,
  'evanrasyidd': User,
}

const typeColor: Record<string, string> = {
  web: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400',
  mobile: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400',
  tool: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400',
  personal: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400',
  physics: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:text-cyan-400',
  '3d': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400',
  creative: 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:text-pink-400',
  'e-commerce': 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400',
  pwa: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400',
}

const typeLabel: Record<string, string> = {
  web: 'Web',
  mobile: 'Mobile',
  tool: 'Tooling',
  personal: 'Personal',
  physics: 'Physics',
  '3d': '3D',
  creative: 'Creative',
  'e-commerce': 'E-Commerce',
  pwa: 'PWA',
}

function gradientFor(seed: string) {
  const grads = [
    'bg-emerald-600/20',
    'bg-violet-600/20',
    'bg-amber-600/20',
    'bg-blue-600/20',
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return grads[h % grads.length]
}

interface Experiment {
  id: string
  title: string
  slug: string
  description: string
  longDesc: string | null
  techStack: string
  category: string
  type: string
  thumbnail: string | null
  demoUrl: string | null
  repoUrl: string | null
  featured: boolean
}

export function ProjectsPage({ projects }: { projects: Experiment[] }) {
  const { t } = useTranslation()
  const [selected, setSelected] = React.useState<Experiment | null>(null)

  const copyFor = (slug: string) => t.experiments.projectCopy?.[slug]

  React.useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected])

  if (selected) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Experiment: ${selected.title}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
              aria-label={t.common.close}
            >
              <X className="h-4 w-4" />
            </button>

            <div className={`relative aspect-[16/8] overflow-hidden ${gradientFor(selected.slug)}`}>
              {selected.thumbnail && (
                <Image
                  src={selected.thumbnail}
                  alt={selected.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              )}
              <div className="absolute inset-0 bg-grid opacity-30" />
              {!selected.thumbnail && (
              <div className="absolute inset-0 grid place-items-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="font-mono text-4xl font-bold text-foreground/80 drop-shadow-sm sm:text-5xl"
                >
                  {selected.title.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()}
                </motion.span>
              </div>
              )}
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge variant="outline" className={`border ${typeColor[selected.type] ?? 'border-primary/30 text-primary'} bg-background/70 backdrop-blur`}>
                  {typeLabel[selected.type] ?? selected.type}
                </Badge>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 scrollbar-thin sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{selected.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{copyFor(selected.slug)?.desc ?? selected.description}</p>

                {selected.longDesc && (
                  <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {(copyFor(selected.slug)?.longDesc ?? selected.longDesc).split('\n\n').map((p, i) => (
                      <p key={i} className="text-pretty">{p}</p>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {t.common.techStack}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.techStack.split(',').map((tech) => (
                      <Badge key={tech} variant="secondary" className="px-2.5 py-1 text-[11px]">{tech.trim()}</Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => setSelected(null)}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t.common.back}
                  </Button>
                  {selected.demoUrl && (
                    <Button asChild size="sm" className="gap-1.5 rounded-full">
                      <a href={selected.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {t.common.liveDemo}
                      </a>
                    </Button>
                  )}
                  {selected.repoUrl && (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
                      <a href={selected.repoUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3.5 w-3.5" />
                        {t.common.sourceCode}
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="py-8 sm:py-12">
      <PageHeader
        title={t.experiments.pageTitle}
        description={t.experiments.pageDesc}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.05, delayChildren: 0.05 },
          },
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((exp) => {
          const Icon = projectIcon[exp.slug] ?? Coffee
          return (
            <motion.div
              key={exp.id}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.95, filter: 'blur(6px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 18,
                    mass: 1,
                  },
                },
              }}
            >
              <Card
                className="group relative h-full cursor-pointer overflow-hidden border-border/40 bg-muted/20 transition-all hover:border-primary/40 hover:bg-muted/40 hover:shadow-md"
                onClick={() => setSelected(exp)}
              >
                <div className="absolute inset-0 bg-grid opacity-10" />
                <CardContent className="relative flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${typeColor[exp.type] ?? 'bg-muted/60 text-muted-foreground/60'} transition-transform group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{exp.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground/70 leading-relaxed">{copyFor(exp.slug)?.desc ?? exp.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`px-2 py-0.5 text-[9px] uppercase tracking-wide ${typeColor[exp.type] ?? 'border-primary/30 text-primary'}`}>
                      {typeLabel[exp.type] ?? exp.type}
                    </Badge>
                    <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground/40 transition-all group-hover:text-muted-foreground/70">
                      {t.common.details} <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
