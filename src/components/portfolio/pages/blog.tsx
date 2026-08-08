'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, Search, X, Share2, Link2, Check, Twitter, Linkedin, BookOpen, Heart, Loader2, Link as AnchorIcon, Rss, Eye, Github, TrendingUp, Flame, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '../page-header'
import { persona, type BlogPost } from '@/lib/portfolio-data'
import { toast } from 'sonner'
import { useTranslation, type Dict, type Locale } from '@/lib/i18n/context'

const categoryColor: Record<string, string> = {
  Workflow: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'Next.js': 'bg-neutral-500/10 text-neutral-500 border-neutral-500/30',
  Android: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  Tools: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  AI: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  Architecture: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
}

function formatDate(d: string, locale: Locale) {
  try {
    const strLocale = locale === 'en' ? 'en-US' : 'id-ID'
    return new Date(d).toLocaleDateString(strLocale, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return d
  }
}

function gradientFor(seed: string) {
  const colors = [
    'bg-emerald-600/20', 'bg-violet-600/20', 'bg-amber-600/20',
    'bg-blue-600/20', 'bg-rose-600/20', 'bg-lime-600/20',
  ]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function BlogPage({ initialPosts = [] }: { initialPosts?: BlogPost[] }) {
  const { t, locale } = useTranslation()
  const [posts, setPosts] = React.useState<BlogPost[]>(initialPosts)
  const [selected, setSelected] = React.useState<BlogPost | null>(null)
  const [activeCategory, setActiveCategory] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [readingProgress, setReadingProgress] = React.useState(0)
  const [viewCounts, setViewCounts] = React.useState<Record<string, number>>({})
  const [currentViews, setCurrentViews] = React.useState(0)

  // Load posts + view counts on mount
  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [postsRes, viewsRes] = await Promise.all([
          fetch('/api/blog?type=posts'),
          fetch('/api/blog?type=views'),
        ])
        const postsData = await postsRes.json()
        if (!cancelled && Array.isArray(postsData.posts)) {
          setPosts(postsData.posts)
        }
        const viewsData = await viewsRes.json()
        if (!cancelled && Array.isArray(viewsData.views)) {
          const map: Record<string, number> = {}
          for (const v of viewsData.views) {
            map[v.postSlug] = v.views
          }
          setViewCounts(map)
        }
      } catch {
        // ignore
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Track view when post is opened
  React.useEffect(() => {
    if (!selected) {
      setCurrentViews(0)
      return
    }
    let cancelled = false
    const track = async () => {
      try {
        const res = await fetch('/api/blog?type=views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: selected.slug }),
        })
        const data = await res.json()
        if (!cancelled && typeof data.views === 'number') {
          setCurrentViews(data.views)
          setViewCounts((prev) => ({ ...prev, [selected.slug]: data.views }))
        }
      } catch {
        // ignore tracking is non-critical
      }
    }
    track()
    return () => { cancelled = true }
  }, [selected])

  // Close article on Escape
  React.useEffect(() => {
    if (!selected) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected])

  // Reading view
  if (selected) {
    return (
      <AnimatePresence mode="wait">
        <motion.article
          key={selected.id}
          data-blog-article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="py-8 sm:py-12"
        >
          {/* Reading progress bar */}
          <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-transparent">
            <div
              className="h-full bg-primary transition-[width] duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>

          <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => setSelected(null)}>
            <ArrowLeft className="h-4 w-4" />
            {t.blog.backToAll}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mx-auto max-w-4xl"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_180px]">
              {/* Main content */}
              <div className="min-w-0">
            {/* Hero banner */}
            <div className={`relative mb-6 aspect-[16/7] overflow-hidden rounded-xl ${gradientFor(selected.slug)}`}>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-mono text-3xl font-bold text-foreground/80 drop-shadow-sm sm:text-4xl">
                  {selected.category.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="absolute left-4 top-4">
                <Badge variant="outline" className={`border ${categoryColor[selected.category] ?? 'border-primary/30 text-primary'} bg-background/70 backdrop-blur`}>
                  {selected.category}
                </Badge>
              </div>
            </div>

            {/* Meta */}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(selected.date, locale)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {String(selected.readTime).replace(' min','')} {t.blog.minRead}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {currentViews} {currentViews === 1 ? t.blog.view : t.blog.views}
              </span>
              <a
                href={`https://github.com/evanrasyidd/portfolio/edit/main/src/content/blog/${selected.slug}.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                aria-label={t.blog.editOnGithub}
                title={t.blog.editOnGithub}
              >
                <Github className="h-3.5 w-3.5" />
                {t.common.edit}
              </a>
            </div>

            {/* Title */}
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{selected.title}</h1>

            {/* Excerpt */}
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{selected.excerpt}</p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selected.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 px-2 py-0.5 text-[10px]">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Content */}
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {selected.content.split('\n\n').map((block, i) => {
                if (block.startsWith('## ')) {
                  const heading = block.replace(/^##\s+/, '')
                  const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  return (
                    <HeadingWithLink key={i} id={id} level={2} t={t}>
                      {heading}
                    </HeadingWithLink>
                  )
                }
                if (block.startsWith('### ')) {
                  const heading = block.replace(/^###\s+/, '')
                  const id = heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  return (
                    <HeadingWithLink key={i} id={id} level={3} t={t}>
                      {heading}
                    </HeadingWithLink>
                  )
                }
                return (
                  <p key={i} className="text-pretty">{block}</p>
                )
              })}
            </div>

            {/* Reaction + Share */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <BlogReactions slug={selected.slug} />
              <ShareButtons post={selected} t={t} />
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={() => setSelected(null)}>
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.blog.backToAll}
              </Button>
              <span className="text-xs text-muted-foreground">{String(selected.readTime).replace(' min','')} {t.blog.minRead}</span>
            </div>

            {/* Related posts */}
            <RelatedPosts current={selected} onSelect={setSelected} t={t} allPosts={posts} />

            {/* Comments */}
            <BlogComments slug={selected.slug} t={t} locale={locale} />
              </div>

              {/* Table of contents sidebar (desktop only) */}
              <div className="hidden lg:block">
                <TableOfContents content={selected.content} progress={readingProgress} t={t} />
              </div>
            </div>
          </motion.div>
        </motion.article>
      </AnimatePresence>
    )
  }

  // List view
  const categories = ['all', ...Array.from(new Set(posts.map((p) => p.category)))]
  const filtered = posts.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    return true
  })

  const featured = filtered.filter((p) => p.featured).slice(0, 2)
  const rest = filtered.filter((p) => !featured.includes(p))

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t.blog.pageTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t.blog.pageDesc}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 shrink-0 gap-1.5 rounded-full">
          <a href="/api/feed.xml" target="_blank" rel="noopener noreferrer" aria-label="RSS feed">
            <Rss className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.blog.rss}</span>
          </a>
        </Button>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t.blog.searchArticles}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-full pl-9 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/60 bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {cat === 'all' ? t.blog.allCategories : cat}
            </button>
          ))}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {filtered.length} {t.blog.posts}
        </Badge>
      </div>

      {/* Popular posts (sorted by views, only when no search/filter active) */}
      {activeCategory === 'all' && !searchQuery.trim() && (
        <PopularPosts viewCounts={viewCounts} onSelect={setSelected} t={t} allPosts={posts} />
      )}

      {/* Featured posts */}
      {featured.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
          className="mb-6 grid gap-4 sm:grid-cols-2"
        >
          {featured.map((post) => (
            <motion.button
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 18,
                  },
                },
              }}
              onClick={() => setSelected(post)}
              className="group relative overflow-hidden rounded-xl border border-border/60 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className={`relative aspect-[16/7] overflow-hidden ${gradientFor(post.slug)}`}>
                <div className="absolute inset-0 bg-dots opacity-30" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-mono text-2xl font-bold text-foreground/70">
                    {post.category.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge variant="outline" className={`border ${categoryColor[post.category] ?? 'border-primary/30 text-primary'} bg-background/70 backdrop-blur`}>
                    {post.category}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-600 backdrop-blur dark:text-amber-400">
                    {t.common.featured}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.date, locale)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {String(post.readTime).replace(' min','')} {t.blog.minRead}
                  </span>
                  {viewCounts[post.slug] > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {viewCounts[post.slug]}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold leading-tight sm:text-lg">{post.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                  {t.blog.readMore}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.04, delayChildren: 0.05 },
            },
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {rest.map((post) => (
            <motion.button
              key={post.id}
              variants={{
                hidden: { opacity: 0, y: 20, filter: 'blur(3px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 18,
                  },
                },
              }}
              onClick={() => setSelected(post)}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className={`border ${categoryColor[post.category] ?? 'border-primary/30 text-primary'} text-[10px]`}>
                  {post.category}
                </Badge>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {viewCounts[post.slug] > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" />
                      {viewCounts[post.slug]}
                    </span>
                  )}
                  <span>{String(post.readTime).replace(' min','')} {t.blog.minRead}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold leading-tight">{post.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.date, locale)}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.blog.noPosts}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ShareButtons({ post, t }: { post: BlogPost; t: Dict }) {
  const [copied, setCopied] = React.useState(false)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#/blog` : ''
  const shareText = `${post.title} by Evan Rasyid Ega Pratama`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareUrl} (post: ${post.slug})`)
      setCopied(true)
      toast.success(t.blog.linkCopied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t.blog.linkCopyFailed)
    }
  }

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground sm:inline">{t.blog.shareLabel}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={copyLink}
        aria-label={t.blog.copyLink}
        title={t.blog.copyLink}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={shareTwitter}
        aria-label={t.blog.shareTwitter}
        title={t.blog.shareTwitter}
      >
        <Twitter className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={shareLinkedIn}
        aria-label={t.blog.shareLinkedin}
        title={t.blog.shareLinkedin}
      >
        <Linkedin className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function RelatedPosts({ current, onSelect, t, allPosts }: { current: BlogPost; onSelect: (p: BlogPost) => void; t: Dict; allPosts: BlogPost[] }) {
  // Find posts with same category or shared tags, exclude current
  const related = allPosts
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0
      if (p.category === current.category) score += 3
      const sharedTags = p.tags.filter((tag) => current.tags.includes(tag)).length
      score += sharedTags
      return { post: p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (related.length === 0) {
    // Fallback: just show latest 3 other posts
    const fallback = allPosts.filter((p) => p.id !== current.id).slice(0, 3)
    return (
      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          {t.blog.moreArticles}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {fallback.map((p) => (
            <RelatedPostCard key={p.id} post={p} onSelect={onSelect} t={t} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        {t.blog.relatedPosts}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map(({ post }) => (
          <RelatedPostCard key={post.id} post={post} onSelect={onSelect} t={t} />
        ))}
      </div>
    </section>
  )
}

function RelatedPostCard({ post, onSelect, t }: { post: BlogPost; onSelect: (p: BlogPost) => void; t: Dict }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.25 }}
      onClick={() => {
        onSelect(post)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="outline" className={`border ${categoryColor[post.category] ?? 'border-primary/30 text-primary'} text-[9px]`}>
          {post.category}
        </Badge>
        <span className="text-[10px] text-muted-foreground">{String(post.readTime).replace(' min','')} {t.blog.minRead}</span>
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{post.title}</h3>
      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
        {t.blog.read}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  )
}

const BLOG_LIKED_KEY = 'portfolio-blog-liked'

function BlogReactions({ slug }: { slug: string }) {
  const [likes, setLikes] = React.useState(0)
  const [liked, setLiked] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  // Load like count + liked state
  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/blog?type=reactions&slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (!cancelled) {
          setLikes(data.likes ?? 0)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
      // Check localStorage for liked state
      try {
        const likedPosts = JSON.parse(localStorage.getItem(BLOG_LIKED_KEY) || '[]')
        if (!cancelled) setLiked(likedPosts.includes(slug))
      } catch {
        // ignore
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const toggleLike = async () => {
    if (submitting) return
    setSubmitting(true)

    const wasLiked = liked
    const newLiked = !wasLiked

    // Optimistic update
    setLiked(newLiked)
    setLikes((l) => Math.max(0, l + (newLiked ? 1 : -1)))

    // Save to localStorage
    try {
      const likedPosts = JSON.parse(localStorage.getItem(BLOG_LIKED_KEY) || '[]')
      const updated = newLiked
        ? [...likedPosts, slug]
        : likedPosts.filter((s: string) => s !== slug)
      localStorage.setItem(BLOG_LIKED_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }

    try {
      const method = newLiked ? 'POST' : 'DELETE'
      const res = await fetch('/api/blog?type=reactions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (res.ok && typeof data.likes === 'number') {
        setLikes(data.likes)
      } else {
        // Revert on error
        setLiked(wasLiked)
        setLikes((l) => Math.max(0, l + (wasLiked ? 1 : -1)))
        toast.error('Failed to update reaction.')
      }
    } catch {
      // Revert on error
      setLiked(wasLiked)
      setLikes((l) => Math.max(0, l + (wasLiked ? 1 : -1)))
      toast.error('Failed to update reaction.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={submitting || loading}
      className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
        liked
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
          : 'border-border/60 bg-card/40 text-muted-foreground hover:border-rose-500/40 hover:text-rose-500'
      }`}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
      aria-pressed={liked}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 transition-all ${
            liked ? 'scale-110 fill-current' : 'group-hover:scale-110'
          } ${submitting ? 'animate-pulse' : ''}`}
        />
      )}
      <span className="tabular-nums">{likes}</span>
      <span className="hidden text-xs sm:inline">{likes === 1 ? 'like' : 'likes'}</span>
    </button>
  )
}

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

function TableOfContents({ content, progress, t }: { content: string; progress: number; t: Dict }) {
  const [activeId, setActiveId] = React.useState<string>('')

  // Parse headings from content
  const headings = React.useMemo<TocItem[]>(() => {
    const items: TocItem[] = []
    const blocks = content.split('\n\n')
    for (const block of blocks) {
      if (block.startsWith('## ')) {
        const text = block.replace(/^##\s+/, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        items.push({ id, text, level: 2 })
      } else if (block.startsWith('### ')) {
        const text = block.replace(/^###\s+/, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        items.push({ id, text, level: 3 })
      }
    }
    return items
  }, [content])

  // Scroll spy
  React.useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <nav className="sticky top-8" aria-label="Table of contents">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.blog.onThisPage}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      {/* Progress bar */}
      <div className="mb-4 h-0.5 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ul className="space-y-1 border-l border-border/60">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={`block border-l-2 py-1 text-xs leading-tight transition-colors ${
                h.level === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === h.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HeadingWithLink({ id, level, children, t }: { id: string; level: 2 | 3; children: React.ReactNode; t: Dict }) {
  const [copied, setCopied] = React.useState(false)

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#${id}` : ''
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(t.blog.sectionLinkCopied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t.blog.linkCopyFailed)
    }
  }

  const Tag = level === 2 ? 'h2' : 'h3'
  const className = level === 2
    ? 'mt-8 scroll-mt-20 text-xl font-bold tracking-tight sm:text-2xl'
    : 'mt-6 scroll-mt-20 text-lg font-semibold tracking-tight sm:text-xl'

  return (
    <Tag id={id} className={`group-heading relative flex items-center gap-2 ${className}`}>
      <a
        href={`#${id}`}
        onClick={copyLink}
        className="absolute -left-7 opacity-0 transition-opacity group-heading:hover:opacity-100"
        aria-label={t.blog.copyLink}
        title={t.blog.copyLink}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <AnchorIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
        )}
      </a>
      {children}
    </Tag>
  )
}

function PopularPosts({ viewCounts, onSelect, t, allPosts }: { viewCounts: Record<string, number>; onSelect: (p: BlogPost) => void; t: Dict; allPosts: BlogPost[] }) {
  const popular = React.useMemo(() => {
    return allPosts
      .map((p) => ({ post: p, views: viewCounts[p.slug] ?? 0 }))
      .filter((x) => x.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
  }, [viewCounts])

  if (popular.length === 0) return null

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t.blog.popularPosts}
        </h2>
        <span className="text-[10px] text-muted-foreground/60">{t.blog.byViews}</span>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.04, delayChildren: 0.05 },
          },
        }}
        className="grid gap-2 sm:grid-cols-3"
      >
        {popular.map(({ post, views }, idx) => (
          <motion.button
            key={post.id}
            custom={idx}
            variants={{
              hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: {
                  type: 'spring',
                  stiffness: 55,
                  damping: 17,
                },
              },
            }}
            onClick={() => onSelect(post)}
            className="group relative overflow-hidden rounded-lg border border-border/60 bg-amber-500/5 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-glow"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                #{idx + 1}
                <TrendingUp className="h-3 w-3" />
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Eye className="h-2.5 w-2.5" />
                {views}
              </span>
            </div>
            <h3 className="line-clamp-2 text-xs font-semibold leading-tight">{post.title}</h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Badge variant="outline" className={`border ${categoryColor[post.category] ?? 'border-primary/30 text-primary'} px-1 py-0 text-[9px]`}>
                {post.category}
              </Badge>
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {String(post.readTime).replace(' min','')}m
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

interface Comment {
  id: string
  name: string
  message: string
  parentId: string | null
  createdAt: string
  replies: Comment[]
}

function timeAgo(iso: string, t: Dict, locale: Locale) {
  try {
    const date = new Date(iso)
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return t.guestbook.justNow
    if (diff < 3600) return `${Math.floor(diff / 60)}${t.guestbook.minAgo}`
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t.guestbook.hourAgo}`
    if (diff < 604800) return `${Math.floor(diff / 86400)}${t.guestbook.dayAgo}`
    const strLocale = locale === 'en' ? 'en-US' : 'id-ID'
    return date.toLocaleDateString(strLocale, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function avatarColor(name: string) {
  const colors = ['bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-amber-500', 'bg-orange-500']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function BlogComments({ slug, t, locale }: { slug: string; t: Dict; locale: Locale }) {
  const [comments, setComments] = React.useState<Comment[]>([])
  const [name, setName] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const replyNameRef = React.useRef<HTMLInputElement>(null)
  const replyMsgRef = React.useRef<HTMLTextAreaElement>(null)

  // Load comments
  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/blog?type=comments&slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (!cancelled) {
          setComments(data.comments || [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [slug])

  const postComment = async (opts: { name: string; message: string; parentId?: string }) => {
    const res = await fetch('/api/blog?type=comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, ...opts }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || t.blog.commentFailed)
    return data.comment as Comment
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return toast.error(t.blog.commentNameError)
    if (message.trim().length < 3) return toast.error(t.blog.commentMessageError)
    if (message.trim().length > 500) return toast.error(t.blog.commentMaxError)

    setSubmitting(true)
    try {
      const comment = await postComment({ name: name.trim(), message: message.trim() })
      setComments((prev) => [{ ...comment, replies: [] }, ...prev])
      setName('')
      setMessage('')
      toast.success(t.blog.commentPosted)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.blog.commentFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const submitReply = async (parentId: string) => {
    const name = replyNameRef.current?.value.trim() || ''
    const message = replyMsgRef.current?.value.trim() || ''
    if (name.length < 2) return toast.error(t.blog.commentNameError)
    if (message.length < 3) return toast.error(t.blog.commentMessageError)
    if (message.length > 500) return toast.error(t.blog.commentMaxError)

    setSubmitting(true)
    try {
      const comment = await postComment({ name, message, parentId })
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, { ...comment, replies: [] }] }
            : c
        )
      )
      setReplyingTo(null)
      toast.success(t.blog.commentPosted)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.blog.commentFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t.blog.comments}
        </h2>
        <Badge variant="outline" className="text-[10px]">
          {totalComments}
        </Badge>
      </div>

      {/* Comment form */}
      <form onSubmit={onSubmit} className="mb-6 space-y-2 rounded-xl border border-border/60 bg-card/40 p-4">
        <Input
          placeholder={t.blog.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="h-9 text-sm"
          aria-label={t.blog.namePlaceholder}
        />
        <Textarea
          placeholder={t.blog.commentPlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          className="text-sm"
          aria-label={t.blog.commentPlaceholder}
        />
        <div className="flex items-center justify-between gap-2">
          <span className={`font-mono text-[10px] ${message.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {message.length}/500
          </span>
          <Button type="submit" disabled={submitting} size="sm" className="gap-1.5 rounded-full">
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t.blog.posting}</>
            ) : (
              <><MessageCircle className="h-3.5 w-3.5" />{t.blog.postComment}</>
            )}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-border/40 p-4">
              <div className="mb-2 h-4 w-32 rounded bg-muted/50" />
              <div className="h-3 w-full rounded bg-muted/30" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t.blog.noComments}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              submitting={submitting}
              submitReply={submitReply}
              replyNameRef={replyNameRef}
              replyMsgRef={replyMsgRef}
              t={t}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentThread({
  comment,
  replyingTo,
  setReplyingTo,
  submitting,
  submitReply,
  replyNameRef,
  replyMsgRef,
  t,
  locale,
}: {
  comment: Comment
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  submitting: boolean
  submitReply: (parentId: string) => void
  replyNameRef: React.RefObject<HTMLInputElement | null>
  replyMsgRef: React.RefObject<HTMLTextAreaElement | null>
  t: Dict
  locale: Locale
}) {
  const isReplying = replyingTo === comment.id
  const isAuthor = comment.name.toLowerCase().includes(persona.name.toLowerCase())

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-border/60 bg-card/40 p-4"
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${avatarColor(comment.name)}`}
          aria-hidden
        >
          {initials(comment.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.name}</span>
            {isAuthor && (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-1.5 py-0 text-[9px] text-primary">
                Author
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt, t, locale)}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{comment.message}</p>
          <button
            onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            className="mt-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {t.guestbook.replyLabel}
          </button>

          {/* Reply form inline */}
          {isReplying && (
            <div className="mt-3 space-y-2 rounded-lg border border-border/40 bg-muted/30 p-3">
              <Input
                ref={replyNameRef}
                placeholder={t.blog.namePlaceholder}
                defaultValue=""
                maxLength={80}
                className="h-8 text-xs"
              />
              <Textarea
                ref={replyMsgRef}
                placeholder={t.blog.commentPlaceholder}
                rows={2}
                maxLength={500}
                className="text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => setReplyingTo(null)}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  size="sm"
                  className="h-7 gap-1 text-[10px]"
                  disabled={submitting}
                  onClick={() => submitReply(comment.id)}
                >
                  {submitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MessageCircle className="h-3 w-3" />
                  )}
                  {t.blog.postComment}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-border/40 pl-4">
          {comment.replies.map((reply) => {
            const isReplyAuthor = reply.name.toLowerCase().includes(persona.name.toLowerCase())
            return (
              <div key={reply.id} className="flex items-start gap-2.5 py-1.5">
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[8px] font-bold text-white ${avatarColor(reply.name)}`}
                  aria-hidden
                >
                  {initials(reply.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{reply.name}</span>
                    {isReplyAuthor && (
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 px-1 py-0 text-[8px] text-primary leading-none">
                        Author
                      </Badge>
                    )}
                    <span className="text-[9px] text-muted-foreground">{timeAgo(reply.createdAt, t, locale)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">{reply.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
