'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  FileText,
  FolderGit2,
  Award,
  Code2,
  Sparkles,
  Quote,
  User,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

interface SearchResult {
  id: string
  type: 'blog' | 'project' | 'achievement' | 'skill' | 'page'
  title: string
  description: string
  route: string
  meta: string
  score: number
}

const RECENT_SEARCHES_KEY = 'portfolio-recent-searches'

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const q = query.trim().toLowerCase()
  const lower = text.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/20 px-0.5 text-foreground">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]').slice(0, 5)
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = loadRecentSearches()
    const updated = [query, ...existing.filter((q) => q !== query)].slice(0, 5)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
  }
}

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  blog: FileText,
  project: FolderGit2,
  achievement: Award,
  skill: Code2,
  page: User,
}

const typeColor: Record<string, string> = {
  blog: 'bg-blue-500/10 text-blue-500',
  project: 'bg-emerald-500/10 text-emerald-500',
  achievement: 'bg-amber-500/10 text-amber-500',
  skill: 'bg-purple-500/10 text-purple-500',
  page: 'bg-cyan-500/10 text-cyan-500',
}

export function GlobalSearch({ open, onOpenChange, onNavigate }: { open: boolean; onOpenChange: (v: boolean) => void; onNavigate: (route: string) => void }) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useTranslation()

  React.useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setRecentSearches(loadRecentSearches())
    } else {
      setQuery('')
      setResults([])
      setActiveIdx(0)
    }
  }, [open])

  React.useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data.results || [])
        setActiveIdx(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[activeIdx]) {
      e.preventDefault()
      handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
    }
    onNavigate(result.route)
    onOpenChange(false)
  }

  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchResult[]>()
    for (const r of results) {
      if (!map.has(r.type)) map.set(r.type, [])
      map.get(r.type)!.push(r)
    }
    return [...map.entries()]
  }, [results])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-background/80 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t.globalSearch.inputAria}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.globalSearch.placeholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label={t.globalSearch.inputAria}
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <button
                onClick={() => onOpenChange(false)}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={t.common.close}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
              {query.trim().length < 2 ? (
                recentSearches.length > 0 ? (
                  <div className="px-2 py-2">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.globalSearch.recentSearches}
                    </div>
                    {recentSearches.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuery(q)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Search className="h-3.5 w-3.5" />
                        {q}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-8 text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">{t.globalSearch.emptyShort}</p>
                  </div>
                )
              ) : results.length === 0 && !loading ? (
                <div className="px-3 py-8 text-center">
                  <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">{t.globalSearch.emptyResults.replace('{query}', query)}</p>
                </div>
              ) : (
                grouped.map(([type, items]) => (
                  <div key={type} className="mb-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.globalSearch.typeLabels[type] || type}
                      </span>
                      <span className={`rounded-full px-1.5 py-0 text-[9px] font-bold ${typeColor[type] ?? 'bg-primary/10 text-primary'}`}>
                        {items.length}
                      </span>
                    </div>
                    {items.map((result) => {
                      const Icon = typeIcon[result.type] ?? FileText
                      const flatIdx = results.indexOf(result)
                      const isActive = flatIdx === activeIdx
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setActiveIdx(flatIdx)}
                          className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                            isActive ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                        >
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${typeColor[result.type] ?? 'bg-primary/10 text-primary'}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{highlightMatch(result.title, query)}</div>
                            <div className="truncate text-[11px] text-muted-foreground">{highlightMatch(result.description, query)}</div>
                          </div>
                          <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:block">{result.meta}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
                  {t.globalSearch.navigate}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                  {t.globalSearch.select}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd>
                  {t.globalSearch.close}
                </span>
              </div>
              {results.length > 0 && (
                <span>{results.length} {t.globalSearch.results}</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
