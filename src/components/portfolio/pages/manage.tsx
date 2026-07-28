'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Trash2, Reply, Mail, Lock, Loader2, Search, ExternalLink, FileText, Plus, Save, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface GBEntry {
  id: string; name: string; message: string; role: string | null
  location: string | null; pinned: boolean; likes: number; createdAt: string
  parentId: string | null; replies?: GBEntry[]
}

interface Comment {
  id: string; postSlug: string; name: string; message: string
  parentId: string | null; createdAt: string; replies: Comment[]
}

function timeAgo(iso: string) {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return new Date(iso).toLocaleDateString()
  } catch { return '' }
}

const SECRET_KEY = 'manage-auth'

export function ManagePage() {
  const [authed, setAuthed] = React.useState(false)
  const [pin, setPin] = React.useState('')
  const [secret, setSecret] = React.useState('')
  const [gb, setGb] = React.useState<GBEntry[]>([])
  const [grouped, setGrouped] = React.useState<Record<string, Comment[]>>({})
  const [gbLoading, setGbLoading] = React.useState(true)
  const [commentLoading, setCommentLoading] = React.useState(true)
  const [replyingTo, setReplyingTo] = React.useState<{ id: string; name: string } | null>(null)
  const [replyMsg, setReplyMsg] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [gbSearch, setGbSearch] = React.useState('')
  const [blogPosts, setBlogPosts] = React.useState<Array<{ id: string; slug: string; title: string; excerpt: string; content: string; category: string; tags: string; featured: boolean; date: string; readTime: string }>>([])
  const [editingPost, setEditingPost] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState({ title: '', slug: '', excerpt: '', content: '', category: '', tags: '', date: '', readTime: '' })
  const [showNewPost, setShowNewPost] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [confirm, setConfirm] = React.useState<{ action: () => void; label: string } | null>(null)
  const [gbReplyTo, setGbReplyTo] = React.useState<string | null>(null)
  const [gbReplyMsg, setGbReplyMsg] = React.useState('')
  const [gbReplying, setGbReplying] = React.useState(false)

  React.useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_KEY)
    if (stored) { setAuthed(true); setSecret(stored) }
  }, [])

  const handleAuth = () => {
    if (!pin.trim()) return toast.error('Enter PIN')
    setSecret(pin.trim())
    sessionStorage.setItem(SECRET_KEY, pin.trim())
    setAuthed(true)
  }

  const loadData = React.useCallback(async () => {
    setGbLoading(true); setCommentLoading(true)
    try {
      const [gbRes, commentRes, postsRes] = await Promise.all([
        fetch('/api/guestbook'),
        fetch('/api/blog?type=comments&all=true'),
        fetch('/api/blog?type=posts'),
      ])
      const gbData = await gbRes.json()
      if (gbData.entries) setGb(gbData.entries)
      const commentData = await commentRes.json()
      if (commentData.grouped) setGrouped(commentData.grouped)
      const postsData = await postsRes.json()
      if (postsData.posts) setBlogPosts(postsData.posts)
    } catch { toast.error('Failed to load data') }
    finally { setGbLoading(false); setCommentLoading(false) }
  }, [])

  React.useEffect(() => { if (authed) loadData() }, [authed, loadData])

  const deleteGb = async (id: string) => {
    const res = await fetch('/api/guestbook', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast.error('Delete failed'); return }
    setGb((prev) => {
      const filtered = prev.filter((e) => e.id !== id)
      return filtered.map((e) => e.replies ? { ...e, replies: e.replies.filter((r) => r.id !== id) } : e)
    })
    toast.success('Deleted')
  }

  const submitGbReply = async (parentId: string) => {
    if (gbReplyMsg.trim().length < 3) return toast.error('Reply min 3 chars')
    setGbReplying(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Evan Rasyid Ega Pratama', message: gbReplyMsg.trim(), parentId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      setGb((prev) => prev.map((e) => e.id === parentId ? { ...e, replies: [...(e.replies || []), { ...data.entry, replies: [] }] } : e))
      setGbReplyMsg(''); setGbReplyTo(null)
      toast.success('Reply posted!')
    } catch { toast.error('Failed') }
    finally { setGbReplying(false) }
  }

  const deleteComment = async (id: string) => {
    const res = await fetch('/api/blog?type=comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) { toast.error('Delete failed'); return }
    setGrouped((prev) => {
      const next = { ...prev }
      for (const slug of Object.keys(next)) {
        next[slug] = next[slug].filter((c) => c.id !== id && !c.replies.some((r) => r.id === id))
        next[slug] = next[slug].map((c) => ({
          ...c,
          replies: c.replies.filter((r) => r.id !== id),
        }))
      }
      return next
    })
    toast.success('Deleted')
  }

  const submitReply = async (parentId: string, postSlug: string) => {
    if (replyMsg.trim().length < 3) return toast.error('Reply min 3 chars')
    setSubmitting(true)
    try {
      const res = await fetch('/api/blog?type=comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: postSlug, name: 'Evan Rasyid Ega Pratama', message: replyMsg.trim(), parentId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      setGrouped((prev) => {
        const next = { ...prev }
        next[postSlug] = (next[postSlug] || []).map((c) =>
          c.id === parentId ? { ...c, replies: [...c.replies, { ...data.comment, replies: [] }] } : c
        )
        return next
      })
      setReplyMsg(''); setReplyingTo(null)
      toast.success('Reply posted!')
    } catch { toast.error('Failed') }
    finally { setSubmitting(false) }
  }

  if (!authed) {
    return (
      <div className="grid min-h-[60vh] place-items-center py-8">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center space-y-4">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Enter PIN to manage</p>
            <Input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
            <Button className="w-full" onClick={handleAuth}>Unlock</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredGb = gbSearch.trim()
    ? gb.filter((e) => e.name.toLowerCase().includes(gbSearch.toLowerCase()) || e.message.toLowerCase().includes(gbSearch.toLowerCase()))
    : gb

  const totalComments = Object.values(grouped).reduce((sum, arr) => sum + arr.length + arr.reduce((s, c) => s + c.replies.length, 0), 0)

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage</h1>
          <p className="text-sm text-muted-foreground">{gb.length} guestbook · {totalComments} comments across {Object.keys(grouped).length} posts</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>Refresh</Button>
      </div>

      {/* Blog Posts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Blog Posts ({blogPosts.length})
          </h2>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => { setShowNewPost(!showNewPost); setEditingPost(null) }}>
            <Plus className="h-3 w-3" /> New Post
          </Button>
        </div>

        {showNewPost && (
          <BlogPostEditor
            post={null}
            secret={secret}
            saving={saving}
            setSaving={setSaving}
            onSave={(p) => { setBlogPosts((prev) => [p, ...prev]); setShowNewPost(false) }}
            onCancel={() => setShowNewPost(false)}
          />
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto mb-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="border-border/40">
              <CardContent className="p-3">
                {editingPost === post.id ? (
                  <BlogPostEditor
                    post={post}
                    secret={secret}
                    saving={saving}
                    setSaving={setSaving}
                    onSave={(updated) => {
                      setBlogPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p))
                      setEditingPost(null)
                    }}
                    onCancel={() => setEditingPost(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => { setEditingPost(post.id); setShowNewPost(false) }}>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{post.title}</span>
                        <Badge variant="outline" className="px-1 py-0 text-[9px]">{post.category}</Badge>
                        {post.featured && <Badge className="px-1 py-0 text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">Featured</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                      <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>{post.date}</span>
                        <span>{post.readTime.replace(' min','')} min</span>
                        <span>{post.slug}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {blogPosts.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No posts yet</p>}
        </div>
      </section>

      {/* Guestbook */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> Guestbook ({gb.length})
          </h2>
          <Input
            placeholder="Search guestbook…" value={gbSearch} onChange={(e) => setGbSearch(e.target.value)}
            className="h-8 w-48 text-xs rounded-full pl-8"
          />
        </div>
        {gbLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/30" />)}</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredGb.map((entry) => (
              <Card key={entry.id} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{entry.name}</span>
                        {entry.pinned && <Badge className="px-1 py-0 text-[9px]">Pinned</Badge>}
                        <span className="text-[10px] text-muted-foreground">{timeAgo(entry.createdAt)}</span>
                        {entry.location && <span className="text-[10px] text-muted-foreground">📍{entry.location}</span>}
                        <span className="text-[10px] text-muted-foreground">❤️{entry.likes}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground/80">{entry.message}</p>

                      {entry.replies && entry.replies.length > 0 && (
                        <div className="mt-2 space-y-1 border-l-2 border-border/30 pl-3">
                          {entry.replies.map((r) => (
                            <div key={r.id} className="flex items-start justify-between gap-2 py-0.5">
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-semibold">{r.name}</span>
                                <span className="text-[9px] text-muted-foreground ml-1.5">{timeAgo(r.createdAt)}</span>
                                <p className="text-[10px] text-foreground/70">{r.message}</p>
                              </div>
                              <Button variant="ghost" size="icon" className="h-4 w-4 text-destructive/60 hover:text-destructive shrink-0"
                                onClick={() => setConfirm({ action: () => deleteGb(r.id), label: 'Delete this reply?' })}>
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {gbReplyTo === entry.id && (
                        <div className="mt-2 space-y-1.5 border-l-2 border-border/40 pl-3">
                          <Textarea rows={2} value={gbReplyMsg} onChange={(e) => setGbReplyMsg(e.target.value)} maxLength={500} className="text-xs" placeholder="Write reply…" />
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setGbReplyTo(null); setGbReplyMsg('') }}>Cancel</Button>
                            <Button size="sm" className="h-7 gap-1 text-[10px]" disabled={gbReplying} onClick={() => submitGbReply(entry.id)}>
                              {gbReplying ? <Loader2 className="h-3 w-3 animate-spin" /> : <Reply className="h-3 w-3" />} Reply
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-primary"
                        onClick={() => setGbReplyTo(gbReplyTo === entry.id ? null : entry.id)}>
                        <Reply className="h-3 w-3" /> Reply
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive/60 hover:text-destructive" onClick={() => setConfirm({ action: () => deleteGb(entry.id), label: 'Delete this entry and its replies?' })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredGb.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No entries</p>}
          </div>
        )}
      </section>

      {/* Blog Comments */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Blog Comments ({totalComments})
        </h2>
        {commentLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/30" />)}</div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([slug, comments]) => {
              const post = blogPosts.find((p) => p.slug === slug)
              return (
                <Card key={slug} className="border-border/40">
                  <CardContent className="p-4">
                    <a
                      href={`/${slug}`} target="_blank" rel="noopener noreferrer"
                      className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      {post?.title ?? slug} <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="space-y-2">
                      {comments.map((c) => (
                        <CommentRow
                          key={c.id} comment={c}
                          replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                          replyMsg={replyMsg} setReplyMsg={setReplyMsg}
                          submitting={submitting} submitReply={submitReply}
                          deleteComment={deleteComment} timeAgo={timeAgo}
                          setConfirm={setConfirm}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Dialog open={!!confirm} onOpenChange={(o) => { if (!o) setConfirm(null) }}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm
            </DialogTitle>
            <DialogDescription className="text-sm">{confirm?.label}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => { confirm?.action(); setConfirm(null) }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BlogPostEditor({ post, secret, saving, setSaving, onSave, onCancel }: {
  post: { id: string; title: string; slug: string; excerpt: string; content: string; category: string; tags: string; featured: boolean; date: string; readTime: string } | null
  secret: string; saving: boolean; setSaving: (v: boolean) => void
  onSave: (post: any) => void; onCancel: () => void
}) {
  const [form, setForm] = React.useState({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? '',
    category: post?.category ?? 'General',
    tags: post?.tags ?? '',
    date: post?.date ?? new Date().toISOString().slice(0, 10),
    readTime: post?.readTime ?? '5',
    featured: post?.featured ?? false,
  })

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      return toast.error('Title, slug, and content required')
    }
    setSaving(true)
    try {
      const method = post ? 'PUT' : 'POST'
      const body = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }
      const res = await fetch('/api/blog?type=posts', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify(post ? { ...body, id: post.id } : body),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(post ? 'Post updated!' : 'Post created!')
      onSave(data.post)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3 mb-3">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Date (YYYY-MM-DD)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-8 text-xs" />
        <Input placeholder="Read time (min)" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })} className="h-8 text-xs" />
      </div>
      <Input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="h-8 text-xs" />
      <Textarea placeholder="Content (supports ## headings and paragraphs)" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="text-xs font-mono" />
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Featured
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="h-7 gap-1 text-xs" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {post ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  )
}

function CommentRow({
  comment, replyingTo, setReplyingTo, replyMsg, setReplyMsg,
  submitting, submitReply, deleteComment, timeAgo, setConfirm,
}: {
  comment: Comment; replyingTo: { id: string; name: string } | null
  setReplyingTo: (v: { id: string; name: string } | null) => void
  replyMsg: string; setReplyMsg: (v: string) => void
  submitting: boolean; submitReply: (parentId: string, postSlug: string) => void
  deleteComment: (id: string) => void; timeAgo: (iso: string) => string
  setConfirm: (v: { action: () => void; label: string } | null) => void
}) {
  const isReplying = replyingTo?.id === comment.id
  const isAuthor = comment.name.toLowerCase().includes('evan')

  return (
    <motion.div layout className="rounded-lg border border-border/30 bg-card/30 p-3 text-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">{comment.name}</span>
            {isAuthor && <Badge className="border-primary/30 bg-primary/10 px-1 py-0 text-[8px] text-primary">Author</Badge>}
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-foreground/80">{comment.message}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-primary"
            onClick={() => setReplyingTo(isReplying ? null : { id: comment.id, name: comment.name })}>
            <Reply className="h-3 w-3" /> Reply
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive"
            onClick={() => setConfirm({ action: () => deleteComment(comment.id), label: 'Delete this comment?' })}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isReplying && (
        <div className="space-y-1.5 pl-4 border-l-2 border-border/40">
          <p className="text-[10px] text-muted-foreground">Replying to <strong>{replyingTo?.name}</strong></p>
          <Textarea rows={2} value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} maxLength={500} className="text-xs" placeholder="Write reply…" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => { setReplyingTo(null); setReplyMsg('') }}>Cancel</Button>
            <Button size="sm" className="h-7 gap-1 text-[10px]" disabled={submitting} onClick={() => submitReply(comment.id, comment.postSlug)}>
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Reply className="h-3 w-3" />}
              Reply
            </Button>
          </div>
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="space-y-1.5 pl-4 border-l-2 border-border/30">
          {comment.replies.map((r) => {
            const isReplyAuthor = r.name.toLowerCase().includes('evan')
            return (
              <div key={r.id} className="flex items-start justify-between gap-2 py-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[11px]">{r.name}</span>
                    {isReplyAuthor && <Badge className="border-primary/30 bg-primary/10 px-1 py-0 text-[7px] text-primary">Author</Badge>}
                    <span className="text-[9px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-foreground/70">{r.message}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive/60 hover:text-destructive shrink-0"
                  onClick={() => setConfirm({ action: () => deleteComment(r.id), label: 'Delete this reply?' })}>
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
