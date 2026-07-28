'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Home,
  Microscope,
  Sparkles,
  Gamepad2,
  FlaskConical,
  LayoutDashboard,
  Notebook,
  BookOpen,
  Mail,
  Link as LinkIcon,
  Command as CommandIcon,
  Menu,
  X,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { ThemeToggle } from './theme-toggle'
import { CommandPalette } from './command-palette'
import { LanguageToggle } from './language-toggle'
import { useRouter, type RouteName } from './router'
import { navLinks, persona } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  microscope: Microscope,
  sparkles: Sparkles,
  'gamepad-2': Gamepad2,
  'flask-conical': FlaskConical,
  'layout-dashboard': LayoutDashboard,
  notebook: Notebook,
  'book-open': BookOpen,
  mail: Mail,
  link: LinkIcon,
  quote: Quote,
}

export function Sidebar() {
  const { route, navigate } = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { t } = useTranslation()

  const handleNav = (to: RouteName) => {
    navigate(to)
    setMobileOpen(false)
  }

  const renderNavList = (onNavigate: (to: RouteName) => void) => (
    <nav className="flex w-full grow flex-col gap-0.5" aria-label={t.sidebar.navAria}>
      {navLinks.map((link) => {
        const Icon = iconMap[link.icon] ?? Home
        const target = (link.href === '/' ? 'home' : link.href.slice(1)) as RouteName
        const active = route === target
        const label = t.nav[link.href === '/' ? 'home' : link.href.slice(1)] ?? link.label
        return (
          <button
            key={link.href}
            onClick={() => onNavigate(target)}
            className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? '' : 'text-muted-foreground'}`} />
            <span className={active ? 'font-semibold' : ''}>{label}</span>
          </button>
        )
      })}
    </nav>
  )

  const renderProfileBlock = () => (
    <div>
      <button
        onClick={() => handleNav('home')}
        className="group flex w-full items-center gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-accent/50"
      >
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 ring-primary/20">
          <Image src="/images/avatar.png" alt={persona.name} fill className="object-cover" sizes="48px" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">{persona.name}</span>
          <span className="text-[11px] text-muted-foreground">{persona.role}</span>
        </span>
      </button>
    </div>
  )

  const renderFooterBlock = () => (
    <div className="flex items-center gap-1.5 border-t border-border/60 pt-3">
      <div className="flex items-center gap-1">
        <CommandPalette>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            aria-label={t.sidebar.cmdAria}
            title={t.sidebar.cmdTitle}
          >
            <CommandIcon className="h-4 w-4" />
          </Button>
        </CommandPalette>

        <LanguageToggle />

        <ThemeToggle />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-border/60 px-4 py-3 lg:hidden">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2"
          aria-label={t.sidebar.homeAria}
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
            <Image src="/images/avatar.png" alt={persona.name} fill className="object-cover" sizes="36px" />
          </span>
          <span className="text-sm font-semibold">{persona.name}</span>
        </button>
        <div className="flex items-center gap-0.5">
          <CommandPalette>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label={t.sidebar.cmdAria}>
              <CommandIcon className="h-4 w-4" />
            </Button>
          </CommandPalette>
          <ThemeToggle />
          <LanguageToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label={t.sidebar.menuAria}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0">
              <SheetTitle className="sr-only">{t.sidebar.menuTitle}</SheetTitle>
              <div className="flex h-full flex-col p-4">
                <div className="mb-4 flex items-center justify-between">
                  {renderProfileBlock()}
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t.sidebar.closeAria}>
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="flex flex-1 flex-col">
                  {renderNavList(handleNav)}
                </div>
                {renderFooterBlock()}
                <div className="mt-2 px-1 text-center text-[10px] tracking-widest text-muted-foreground/30">
                  @evanrasyidd
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border/40 lg:bg-primary/[0.02] lg:px-3 lg:py-6">
        <div className="sticky top-0 flex h-full flex-col gap-2">
          <div className="mt-1">
            {renderProfileBlock()}
          </div>
          {renderNavList(handleNav)}
          <div className="mt-auto">
            {renderFooterBlock()}
            <div className="mt-3 px-1 text-center text-[10px] tracking-widest text-muted-foreground/30">
              @evanrasyidd
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
