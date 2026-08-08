'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Globe, Mail, Github, ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { persona, linkTree } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  github: Github,
}

const iconBg: Record<string, string> = {
  globe: 'bg-emerald-500/10 text-emerald-500',
  github: 'bg-neutral-500/10 text-neutral-500',
}

export function LinksPage() {
  const { t } = useTranslation()

  return (
    <div className="py-8 sm:py-12">
      {/* Hero profile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <div className="mx-auto mb-4">
          <span className="relative mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-border">
            <Image src="/images/avatar.webp" alt={persona.name} fill className="object-cover" sizes="96px" />
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{persona.name}</h1>
        <p className="text-sm text-muted-foreground">{persona.role}</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {persona.location} {persona.flag}
        </p>
      </motion.div>

      {/* Link tree */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.06, delayChildren: 0.15 },
          },
        }}
        className="mx-auto max-w-md space-y-3"
      >
        {linkTree.map((item) => {
          const Icon = iconMap[item.icon] ?? Globe
          return (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, x: -20, scale: 0.95, filter: 'blur(4px)' },
                visible: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 16,
                  },
                },
              }}
            >
              <Card className="group overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow">
                <CardContent className="p-4">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconBg[item.icon] ?? 'bg-primary/10 text-primary'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold">{item.label}</h3>
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Get in touch */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mx-auto mt-8 max-w-md"
      >
        <Card className="overflow-hidden border-border/60 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-semibold">{t.links.getInTouch}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t.links.getInTouchDesc}</p>
            <Button asChild size="sm" className="mt-4 gap-2 rounded-full">
              <a href={`mailto:${persona.email}`}>
                <Mail className="h-3.5 w-3.5" />
                {t.links.sendEmail}
              </a>
            </Button>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">{persona.email}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
