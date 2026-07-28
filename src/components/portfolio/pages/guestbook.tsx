'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Send, MessageSquare, Pin, MapPin, Loader2, Heart, Search, Reply } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageHeader } from '../page-header'
import { useTranslation, type Dict } from '@/lib/i18n/context'

const schema = (t: Dict) => z.object({
  name: z.string().min(2, t.validation.nameMin).max(80),
  message: z.string().min(3, t.validation.messageMin).max(500, t.validation.messageMax),
  role: z.string().max(80).optional(),
  location: z.string().max(80).optional(),
})

type FormValues = z.infer<ReturnType<typeof schema>>

interface GuestbookEntry {
  id: string
  name: string
  message: string
  role: string | null
  location: string | null
  pinned: boolean
  likes: number
  parentId: string | null
  createdAt: string | Date
  replies?: GuestbookEntry[]
}

const LIKED_KEY = 'portfolio-liked-entries'

function timeAgo(iso: string | Date, t: Dict) {
  try {
    const date = new Date(iso)
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return t.guestbook.justNow
    if (diff < 3600) return `${Math.floor(diff / 60)}${t.guestbook.minAgo}`
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t.guestbook.hourAgo}`
    if (diff < 604800) return `${Math.floor(diff / 86400)}${t.guestbook.dayAgo}`
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function avatarColor(name: string) {
  const colors = ['bg-blue-600', 'bg-amber-600', 'bg-emerald-600', 'bg-red-600', 'bg-violet-600', 'bg-orange-600', 'bg-teal-600', 'bg-rose-600', 'bg-lime-600', 'bg-indigo-600', 'bg-cyan-600']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function GuestbookPage({ initialEntries }: { initialEntries: GuestbookEntry[] }) {
  const { t } = useTranslation()
  const [entries, setEntries] = React.useState<GuestbookEntry[]>(initialEntries)
  const [submitting, setSubmitting] = React.useState(false)
  const [likedIds, setLikedIds] = React.useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [liking, setLiking] = React.useState<string | null>(null)
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const [replyMsg, setReplyMsg] = React.useState('')
  const [replyName, setReplyName] = React.useState('')
  const [replySubmitting, setReplySubmitting] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LIKED_KEY)
      if (stored) setLikedIds(new Set(JSON.parse(stored)))
    } catch {}
    fetch('/api/guestbook').then(r => r.json()).then(data => {
      if (data.entries) setEntries(data.entries)
    }).catch(() => {})
  }, [])

  const saveLiked = (ids: Set<string>) => {
    try { localStorage.setItem(LIKED_KEY, JSON.stringify([...ids])) } catch {}
  }

  const toggleLike = async (entryId: string) => {
    const isLiked = likedIds.has(entryId)
    const action = isLiked ? 'unlike' : 'like'
    const newLiked = new Set(likedIds)
    if (isLiked) newLiked.delete(entryId); else newLiked.add(entryId)
    setLikedIds(newLiked); saveLiked(newLiked)
    setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, likes: Math.max(0, e.likes + (isLiked ? -1 : 1)) } : e))
    setLiking(entryId)
    try {
      const res = await fetch('/api/guestbook', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entryId, action }) })
      const data = await res.json()
      if (res.ok && typeof data.likes === 'number') setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, likes: data.likes } : e))
    } catch {
      const reverted = new Set(likedIds)
      if (isLiked) reverted.add(entryId); else reverted.delete(entryId)
      setLikedIds(reverted); saveLiked(reverted)
      setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, likes: Math.max(0, e.likes + (isLiked ? 1 : -1)) } : e))
      toast.error(t.guestbook.likeFailed)
    } finally { setLiking(null) }
  }

  const submitReply = async (parentId: string) => {
    if (!replyName.trim() || replyName.length < 2) return toast.error('Name min 2 chars')
    if (replyMsg.trim().length < 3) return toast.error('Reply min 3 chars')
    setReplySubmitting(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: replyName.trim(), message: replyMsg.trim(), parentId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      setEntries((prev) => prev.map((e) => e.id === parentId ? { ...e, replies: [...(e.replies || []), { ...data.entry, replies: [] }] } : e))
      setReplyMsg(''); setReplyingTo(null)
      toast.success('Reply posted!')
    } catch { toast.error('Failed') }
    finally { setReplySubmitting(false) }
  }

  const filteredEntries = React.useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) =>
      e.name.toLowerCase().includes(q) || e.message.toLowerCase().includes(q) ||
      (e.role?.toLowerCase().includes(q) ?? false) || (e.location?.toLowerCase().includes(q) ?? false)
    )
  }, [entries, searchQuery])

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema(t)),
    defaultValues: { name: '', message: '', role: '', location: '' },
  })

  const messageValue = watch('message') || ''
  const charCount = messageValue.length

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || t.guestbook.messageFailed); return }
      setEntries((prev) => [{ ...data.entry, replies: [] }, ...prev])
      reset()
      toast.success(t.guestbook.messageSent)
    } catch { toast.error(t.guestbook.messageFailed) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="py-8 sm:py-12">
      <PageHeader title={t.guestbook.pageTitle} description={t.guestbook.pageDesc} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 h-fit overflow-hidden border-border/60 lg:sticky lg:top-20">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Send className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{t.guestbook.writeMessage}</h3>
                <p className="truncate text-xs text-muted-foreground">{t.guestbook.signInDesc}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="gb-name" className="text-xs font-medium">{t.guestbook.nameLabel}</label>
                <Input id="gb-name" placeholder={t.guestbook.namePlaceholder} {...register('name')} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="gb-role" className="text-xs font-medium">{t.guestbook.roleLabel}</label>
                  <Input id="gb-role" placeholder={t.guestbook.rolePlaceholder} {...register('role')} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="gb-loc" className="text-xs font-medium">{t.guestbook.locationLabel}</label>
                  <Input id="gb-loc" placeholder={t.guestbook.locationPlaceholder} {...register('location')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="gb-msg" className="text-xs font-medium">{t.guestbook.messageLabel}</label>
                <Textarea id="gb-msg" rows={4} placeholder={t.guestbook.messagePlaceholder} {...register('message')} aria-invalid={!!errors.message} />
                <div className="flex items-center justify-between">
                  {errors.message ? (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  ) : <span className="text-xs text-muted-foreground">{t.guestbook.maxChars}</span>}
                  <span className={`font-mono text-[10px] ${charCount > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>{charCount}/500</span>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.sending}</> : <><Send className="mr-2 h-4 w-4" />{t.guestbook.sendMessage}</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" /> {filteredEntries.length} {t.guestbook.messages}
            </p>
            <Badge variant="outline" className="text-[10px]">{t.guestbook.sortedByNewest}</Badge>
          </div>

          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder={t.guestbook.searchMessages} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 rounded-full pl-9 text-xs" />
          </div>

          <Card className="overflow-hidden border-border/60">
            <ScrollArea className="h-[520px]">
              <div className="divide-y divide-border/50">
                <AnimatePresence initial={false}>
                  {filteredEntries.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">{searchQuery ? t.guestbook.noMessagesSearch : t.guestbook.noMessages}</p>
                    </div>
                  ) : (
                    filteredEntries.map((entry) => {
                      const isLiked = likedIds.has(entry.id)
                      const isLiking = liking === entry.id
                      const isReplying = replyingTo === entry.id
                      return (
                        <motion.div key={entry.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }} className="group p-4 transition-colors hover:bg-accent/30">
                          <div className="flex gap-3">
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${avatarColor(entry.name)}`} aria-hidden>
                              {initials(entry.name)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-semibold">{entry.name}</span>
                                {entry.pinned && (
                                  <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[9px] text-amber-600 dark:text-amber-400">
                                    <Pin className="h-2.5 w-2.5" />{t.common.pinned}
                                  </Badge>
                                )}
                                {entry.role && <span className="text-[11px] text-muted-foreground">• {entry.role}</span>}
                              </div>
                              <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{entry.message}</p>
                              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>{timeAgo(entry.createdAt, t)}</span>
                                {entry.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{entry.location}</span>}
                                <button onClick={() => setReplyingTo(isReplying ? null : entry.id)} className="flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-all hover:bg-accent hover:text-primary">
                                  <Reply className="h-3 w-3" /> Reply
                                </button>
                                <button onClick={() => toggleLike(entry.id)} disabled={isLiking}
                                  className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 font-medium transition-all hover:bg-accent disabled:opacity-50 ${isLiked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                                  aria-label={isLiked ? t.guestbook.unlikeAria : t.guestbook.likeAria} aria-pressed={isLiked}>
                                  <Heart className={`h-3 w-3 transition-all ${isLiked ? 'scale-110 fill-current' : 'group-hover:scale-110'} ${isLiking ? 'animate-pulse' : ''}`} />
                                  <span className="tabular-nums">{entry.likes}</span>
                                </button>
                              </div>

                              {isReplying && (
                                <div className="mt-3 space-y-2 rounded-lg border border-border/30 bg-muted/20 p-3">
                                  <Input placeholder="Your name" value={replyName} onChange={(e) => setReplyName(e.target.value)} className="h-8 text-xs" />
                                  <Textarea rows={2} value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} maxLength={500} className="text-xs" placeholder="Write a reply..." />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setReplyingTo(null); setReplyMsg(''); setReplyName('') }}>Cancel</Button>
                                    <Button size="sm" className="h-7 gap-1 text-[10px]" disabled={replySubmitting} onClick={() => submitReply(entry.id)}>
                                      {replySubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Reply className="h-3 w-3" />} Reply
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {entry.replies && entry.replies.length > 0 && (
                                <div className="mt-3 space-y-2 border-l-2 border-border/30 pl-4">
                                  {entry.replies.map((r) => (
                                    <div key={r.id} className="flex items-start gap-2 py-1">
                                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white ${avatarColor(r.name)}`}>
                                        {initials(r.name)}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold">{r.name}</span>
                                          <span className="text-[9px] text-muted-foreground">{timeAgo(r.createdAt, t)}</span>
                                        </div>
                                        <p className="text-xs text-foreground/80">{r.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
