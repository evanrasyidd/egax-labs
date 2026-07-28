import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, ipFrom } from '@/lib/rate-limit'
import { sanitize, adminAuth } from '@/lib/sanitize'

function cached(data: unknown, ttl = 60) {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}` },
  })
}

// ── GET ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'posts'
    const slug = searchParams.get('slug')
    const allParam = searchParams.get('all')

    if (type === 'posts') {
      if (slug) {
        const post = await db.blogPost.findUnique({ where: { slug } })
        if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ post: { ...post, tags: post.tags ? post.tags.split(',') : [] } })
      }
      const posts = await db.blogPost.findMany({ orderBy: { sort: 'asc' } })
      return cached({
        posts: posts.map((p) => ({ ...p, tags: p.tags ? p.tags.split(',') : [] })),
      }, 180)
    }

    if (type === 'comments') {
      if (!slug && allParam !== 'true') {
        return NextResponse.json({ comments: [] })
      }
      const isAll = allParam === 'true'
      const all = await db.blogComment.findMany({
        where: isAll ? undefined : { postSlug: slug! },
        orderBy: { createdAt: 'desc' },
        take: isAll ? 500 : 100,
      })
      const topLevel = all.filter((c) => !c.parentId)
      const replyMap: Record<string, typeof all> = {}
      for (const c of all) {
        if (c.parentId) {
          if (!replyMap[c.parentId]) replyMap[c.parentId] = []
          replyMap[c.parentId].push(c)
        }
      }
      const comments = topLevel.map((c) => ({
        ...c,
        replies: (replyMap[c.id] || []).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      if (isAll) {
        const grouped: Record<string, typeof comments> = {}
        for (const c of comments) {
          if (!grouped[c.postSlug]) grouped[c.postSlug] = []
          grouped[c.postSlug].push(c)
        }
        return cached({ grouped, total: all.length }, 30)
      }
      return cached({ comments }, 30)
    }

    if (type === 'reactions') {
      if (slug) {
        const reaction = await db.blogReaction.findUnique({ where: { postSlug: slug } })
        return cached({ likes: reaction?.likes ?? 0 }, 30)
      }
      const reactions = await db.blogReaction.findMany()
      return cached({ reactions }, 30)
    }

    if (type === 'views') {
      if (slug) {
        const view = await db.blogView.findUnique({ where: { postSlug: slug } })
        return cached({ views: view?.views ?? 0 }, 30)
      }
      const views = await db.blogView.findMany()
      return cached({ views }, 30)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Blog GET error:', err)
    return NextResponse.json({ posts: [], comments: [], likes: 0, views: 0 }, { status: 200 })
  }
}

// ── POST ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'views'
    const body = await req.json()

    if (type === 'posts') {
      if (!adminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const slug = sanitize(body.slug, 120)
      const title = sanitize(body.title, 200)
      const excerpt = sanitize(body.excerpt, 300)
      const content = sanitize(body.content, 50000)
      const category = sanitize(body.category, 50)
      const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitize(t, 50)) : []
      const featured = !!body.featured
      if (!slug || !title || !content) {
        return NextResponse.json({ error: 'slug, title, and content required.' }, { status: 400 })
      }
      const existing = await db.blogPost.findUnique({ where: { slug } })
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
      }
      const maxSort = await db.blogPost.aggregate({ _max: { sort: true } })
      const post = await db.blogPost.create({
        data: {
          slug, title,
          excerpt: excerpt || content.slice(0, 160),
          content,
          date: body.date || new Date().toISOString().slice(0, 10),
          readTime: body.readTime || `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min`,
          category, tags: tags.join(','), featured,
          sort: (maxSort._max.sort ?? 0) + 1,
        },
      })
      return NextResponse.json({ post: { ...post, tags: post.tags ? post.tags.split(',') : [] } }, { status: 201 })
    }

    if (type === 'comments') {
      if (!(rateLimit(`blog-comment:${ipFrom(req)}`, 5, 60000))) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
      }
      const slug = sanitize(body.slug, 120)
      const name = sanitize(body.name, 80)
      const message = sanitize(body.message, 500)
      const parentId = body.parentId ? sanitize(body.parentId, 80) : null
      if (!slug) return NextResponse.json({ error: 'Post slug required.' }, { status: 400 })
      if (!name || name.length < 2) return NextResponse.json({ error: 'Name min 2 characters.' }, { status: 400 })
      if (!message || message.length < 3) return NextResponse.json({ error: 'Comment min 3 characters.' }, { status: 400 })
      if (parentId) {
        const parent = await db.blogComment.findUnique({ where: { id: parentId } })
        if (!parent) return NextResponse.json({ error: 'Parent comment not found.' }, { status: 404 })
        if (parent.parentId) return NextResponse.json({ error: 'Can only reply to top-level comments.' }, { status: 400 })
      }
      const comment = await db.blogComment.create({
        data: { postSlug: slug, name, message, parentId },
      })
      return NextResponse.json({ comment }, { status: 201 })
    }

    if (type === 'reactions') {
      if (!(rateLimit(`blogreact:${ipFrom(req)}`, 5, 60000))) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
      }
      const slug = sanitize(body.slug, 120)
      if (!slug) return NextResponse.json({ error: 'Slug required.' }, { status: 400 })
      const reaction = await db.blogReaction.upsert({
        where: { postSlug: slug },
        update: { likes: { increment: 1 } },
        create: { postSlug: slug, likes: 1 },
      })
      return NextResponse.json({ likes: reaction.likes }, { status: 201 })
    }

    if (!(rateLimit(`blogview:${ipFrom(req)}`, 10, 60000))) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }
    const slug = sanitize(body.slug, 120)
    if (!slug) return NextResponse.json({ error: 'Slug required.' }, { status: 400 })
    const view = await db.blogView.upsert({
      where: { postSlug: slug },
      update: { views: { increment: 1 } },
      create: { postSlug: slug, views: 1 },
    })
    return NextResponse.json({ views: view.views }, { status: 201 })
  } catch (err) {
    console.error('Blog POST error:', err)
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}

// ── PUT ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'posts'
    if (type !== 'posts') return NextResponse.json({ error: 'PUT only supported for posts.' }, { status: 400 })

    if (!adminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const id = sanitize(body.id, 80)
    if (!id) return NextResponse.json({ error: 'ID required.' }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (body.title) data.title = sanitize(body.title, 200)
    if (body.excerpt) data.excerpt = sanitize(body.excerpt, 300)
    if (body.content) data.content = sanitize(body.content, 50000)
    if (body.category) data.category = sanitize(body.category, 50)
    if (body.tags) data.tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => sanitize(t, 50)).join(',') : sanitize(body.tags, 500)
    if (body.slug) data.slug = sanitize(body.slug, 120)
    if (body.readTime) data.readTime = sanitize(body.readTime, 50)
    if (body.date) data.date = sanitize(body.date, 20)
    if (typeof body.featured === 'boolean') data.featured = body.featured
    if (typeof body.sort === 'number') data.sort = body.sort

    const post = await db.blogPost.update({ where: { id }, data })
    return NextResponse.json({ post: { ...post, tags: post.tags ? post.tags.split(',') : [] } })
  } catch (err) {
    console.error('Blog PUT error:', err)
    return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 })
  }
}

// ── DELETE ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'posts'
    const body = await req.json()
    const id = sanitize(body.id, 80)
    if (!id) return NextResponse.json({ error: 'ID required.' }, { status: 400 })

    if (type === 'posts') {
      if (!adminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      await db.blogPost.delete({ where: { id } })
      return NextResponse.json({ deleted: true })
    }

    if (type === 'comments') {
      if (!(rateLimit(`blogcomment-del:${ipFrom(req)}`, 10, 60000))) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
      }
      if (!adminAuth(req)) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
      }
      await db.blogComment.delete({ where: { id } })
      return NextResponse.json({ deleted: true })
    }

    if (type === 'reactions') {
      if (!(rateLimit(`blogreact-del:${ipFrom(req)}`, 5, 60000))) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
      }
      const slug = sanitize(body.slug, 120)
      if (!slug) return NextResponse.json({ error: 'Slug required.' }, { status: 400 })
      const existing = await db.blogReaction.findUnique({ where: { postSlug: slug } })
      if (existing && existing.likes > 0) {
        const reaction = await db.blogReaction.update({
          where: { postSlug: slug },
          data: { likes: { decrement: 1 } },
        })
        return NextResponse.json({ likes: reaction.likes })
      }
      return NextResponse.json({ likes: 0 })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err) {
    console.error('Blog DELETE error:', err)
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}
