'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Command,
  Search,
  Moon,
  Sun,
  ArrowUp,
  Home,
  User,
  Sparkles,
  Gamepad2,
  FlaskConical,
  LayoutDashboard,
  Notebook,
  BookOpen,
  Mail,
  Link as LinkIcon,
  X,
  Quote,
  Keyboard,
  Search as SearchIcon,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface Shortcut {
  keys: string[]
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  groupKey: string
}

export function ShortcutsHelp({ open, onOpenChange }: { open: boolean; onClose?: () => void; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation()

  const shortcuts: Shortcut[] = [
    { keys: ['⌘', 'K'], labelKey: 'cmd', icon: Command, groupKey: 'general' },
    { keys: ['⌘', '/'], labelKey: 'globalSearch', icon: SearchIcon, groupKey: 'general' },
    { keys: ['?'], labelKey: 'shortcuts', icon: Keyboard, groupKey: 'general' },
    { keys: ['Esc'], labelKey: 'close', icon: X, groupKey: 'general' },
    { keys: ['T'], labelKey: 'cycleTheme', icon: Sun, groupKey: 'general' },
    { keys: ['G', 'H'], labelKey: 'home', icon: Home, groupKey: 'navigation' },
    { keys: ['G', 'A'], labelKey: 'about', icon: User, groupKey: 'navigation' },
    { keys: ['G', 'V'], labelKey: 'playground', icon: Gamepad2, groupKey: 'navigation' },
    { keys: ['G', 'P'], labelKey: 'experiments', icon: FlaskConical, groupKey: 'navigation' },
    { keys: ['G', 'D'], labelKey: 'dashboard', icon: LayoutDashboard, groupKey: 'navigation' },
    { keys: ['G', 'B'], labelKey: 'guestbook', icon: BookOpen, groupKey: 'navigation' },
    { keys: ['G', 'M'], labelKey: 'contact', icon: Mail, groupKey: 'navigation' },
    { keys: ['G', 'L'], labelKey: 'links', icon: LinkIcon, groupKey: 'navigation' },
    { keys: ['G', 'N'], labelKey: 'devlog', icon: Notebook, groupKey: 'navigation' },
    { keys: ['↑', 'Top'], labelKey: 'backToTop', icon: ArrowUp, groupKey: 'general' },
  ]

  const groups = React.useMemo(() => {
    const map = new Map<string, Shortcut[]>()
    for (const s of shortcuts) {
      if (!map.has(s.groupKey)) map.set(s.groupKey, [])
      map.get(s.groupKey)!.push(s)
    }
    return [...map.entries()]
  }, [])

  const groupNames: Record<string, string> = {
    general: t.shortcuts.groups.general,
    navigation: t.shortcuts.groups.navigation,
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.shortcuts.title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Keyboard className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">{t.shortcuts.title}</h2>
                  <p className="text-[11px] text-muted-foreground">{t.shortcuts.desc}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto p-5 scrollbar-thin">
              {groups.map(([groupKey, items]) => (
                <div key={groupKey} className="mb-5 last:mb-0">
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {groupNames[groupKey] || groupKey}
                  </h3>
                  <div className="space-y-1">
                    {items.map((s) => (
                      <div
                        key={s.labelKey}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <s.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground/90">
                            {t.shortcuts.labels[s.labelKey as keyof typeof t.shortcuts.labels] || s.labelKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {s.keys.map((k, i) => (
                            <kbd
                              key={i}
                              className="min-w-[1.5rem] rounded border border-border bg-muted px-1.5 py-0.5 text-center font-mono text-[10px] font-medium text-foreground shadow-sm"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 px-5 py-3 text-center">
              <p className="text-[11px] text-muted-foreground">
                {t.shortcuts.tip}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Hook that manages the shortcuts overlay state and global key listener */
export function useShortcutsHelp(navigate: (route: string) => void, cycleTheme: () => void, scrollTop: () => void) {
  const [helpOpen, setHelpOpen] = React.useState(false)
  const keyBuffer = React.useRef<string[]>([])
  const bufferTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    const isInput = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
    }

    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isInput(e.target)) return
      if (helpOpen && e.key !== 'Escape') return

      if (e.key === 'Escape') {
        setHelpOpen(false)
        return
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setHelpOpen((o) => !o)
        return
      }

      if (e.key.toLowerCase() === 't' && keyBuffer.current.length === 0) {
        e.preventDefault()
        cycleTheme()
        return
      }

      if (e.key.toLowerCase() === 'g' && keyBuffer.current.length === 0) {
        keyBuffer.current = ['g']
        if (bufferTimer.current) clearTimeout(bufferTimer.current)
        bufferTimer.current = setTimeout(() => {
          keyBuffer.current = []
        }, 800)
        return
      }

      if (keyBuffer.current[0] === 'g' && keyBuffer.current.length === 1) {
        const map: Record<string, string> = {
          h: 'home',
          a: 'about',
          v: 'playground',
          p: 'experiments',
          d: 'dashboard',
          b: 'guestbook',
          m: 'contact',
          l: 'links',
          n: 'devlog',
        }
        const target = map[e.key.toLowerCase()]
        if (target) {
          e.preventDefault()
          navigate(target)
        }
        keyBuffer.current = []
        if (bufferTimer.current) clearTimeout(bufferTimer.current)
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (bufferTimer.current) clearTimeout(bufferTimer.current)
    }
  }, [helpOpen, navigate, cycleTheme, scrollTop])

  return { helpOpen, setHelpOpen }
}
