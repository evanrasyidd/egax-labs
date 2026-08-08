'use client'

import * as React from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Home,
  User,
  Sparkles,
  Gamepad2,
  FlaskConical,
  Gauge,
  Notebook,
  BookOpen,
  Mail,
  Link as LinkIcon,
  Github,
  Linkedin,
  Instagram,
  Moon,
  Sun,
  Palette,
  Terminal,
  ExternalLink,
  Quote,
  Search,
  Keyboard,
  ArrowUp,
} from 'lucide-react'
import { useTheme, type ThemeName } from './theme-provider'
import { useRouter, type RouteName } from './router'
import { navLinks, persona } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  user: User,
  sparkles: Sparkles,
  'gamepad-2': Gamepad2,
  'flask-conical': FlaskConical,
  'layout-dashboard': Gauge,
  notebook: Notebook,
  'book-open': BookOpen,
  mail: Mail,
  link: LinkIcon,
  quote: Quote,
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  mail: Mail,
}

const themes: { key: ThemeName; labelKey: string }[] = [
  { key: 'dark', labelKey: 'dark' },
  { key: 'light', labelKey: 'light' },
  { key: 'valentine', labelKey: 'Valentine' },
]

export function CommandPalette({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const { navigate } = useRouter()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const go = (to: RouteName) => {
    setOpen(false)
    setTimeout(() => navigate(to), 50)
  }

  const themeLabels: Record<string, string> = {
    dark: t.cmd.dark,
    light: t.cmd.light,
    Valentine: 'Valentine',
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t.cmd.placeholder} />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{t.cmd.empty}</CommandEmpty>
          <CommandGroup heading={t.cmd.pages}>
            {navLinks.map((link) => {
              const Icon = iconMap[link.icon] ?? Home
              const target = (link.href === '/' ? 'home' : link.href.slice(1)) as RouteName
              const label = t.nav[link.href === '/' ? 'home' : link.href.slice(1)] ?? link.label
              return (
                <CommandItem
                  key={link.href}
                  value={`${label} ${t.cmd.pages} navigasi`}
                  onSelect={() => go(target)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t.cmd.social}>
            {persona.socials.map((s) => {
              const Icon = socialIconMap[s.icon] ?? ExternalLink
              return (
                <CommandItem
                  key={s.label}
                  value={`${s.label} ${t.cmd.social} link eksternal`}
                  onSelect={() => {
                    setOpen(false)
                    setTimeout(() => window.open(s.url, '_blank', 'noopener,noreferrer'), 50)
                  }}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{s.label}</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground/60" />
                </CommandItem>
              )
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t.cmd.actions}>
            <CommandItem
              value={`${t.cmd.globalSearch} ${t.cmd.actions}`}
              onSelect={() => {
                setOpen(false)
                setTimeout(() => window.dispatchEvent(new CustomEvent('portfolio:open-search')), 50)
              }}
              className="cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{t.cmd.globalSearch}</span>
              <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                ⌘/
              </kbd>
            </CommandItem>
            <CommandItem
              value={`${t.cmd.keyboardShortcuts} ${t.cmd.actions}`}
              onSelect={() => {
                setOpen(false)
                setTimeout(() => window.dispatchEvent(new CustomEvent('portfolio:open-shortcuts')), 50)
              }}
              className="cursor-pointer"
            >
              <Keyboard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{t.cmd.keyboardShortcuts}</span>
              <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                ?
              </kbd>
            </CommandItem>
            <CommandItem
              value={`${t.common.backToTop} ${t.cmd.actions}`}
              onSelect={() => {
                setOpen(false)
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
              }}
              className="cursor-pointer"
            >
              <ArrowUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{t.common.backToTop}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={t.cmd.theme}>
            {themes.map((th) => {
              const label = themeLabels[th.labelKey]
              return (
                <CommandItem
                  key={th.key}
                  value={`ganti tema ${label} mode theme`}
                  onSelect={() => {
                    setTheme(th.key)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  {th.key === 'dark' ? (
                    <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : th.key === 'light' ? (
                    <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{t.cmd.mode.replace('{label}', label)}</span>
                  {theme === th.key && <span className="ml-auto text-xs text-primary">{t.cmd.active}</span>}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
        <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            {t.cmd.freeText}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono">{t.cmd.closeKey}</kbd>
            {t.cmd.closeHint}
          </span>
        </div>
      </CommandDialog>
    </>
  )
}
