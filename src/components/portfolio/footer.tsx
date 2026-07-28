'use client'

import * as React from 'react'
import { Github, Linkedin, Instagram, Mail, Heart, Code2 } from 'lucide-react'
import { persona } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
}

export function Footer() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <footer className="mt-auto border-t border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-muted-foreground">
          {t.footer.copyright.replace('{year}', String(year)).replace('{name}', persona.name)}
        </p>
        <div className="flex items-center gap-1.5">
          {persona.socials.slice(0, 4).map((s) => {
            const Icon = socialIconMap[s.icon] ?? Mail
            return (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={s.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
