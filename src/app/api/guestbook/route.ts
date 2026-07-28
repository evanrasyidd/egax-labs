import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, ipFrom } from '@/lib/rate-limit'
import { sanitize, adminAuth } from '@/lib/sanitize'

export async function GET() {
  try {
    const all = await db.guestbook.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })
    const topLevel = all.filter((e) => !e.parentId)
    const replyMap: Record<string, typeof all> = {}
    for (const e of all) {
      if (e.parentId) {
        if (!replyMap[e.parentId]) replyMap[e.parentId] = []
        replyMap[e.parentId].push(e)
      }
    }
    const entries = topLevel.map((e) => ({
      ...e,
      replies: (replyMap[e.id] || []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }))
    return NextResponse.json({ entries }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err) {
    console.error('Guestbook GET error:', err)
    return NextResponse.json({ entries: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`guestbook:${ipFrom(req)}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const name = sanitize(body.name, 80)
    const message = sanitize(body.message, 500)
    const role = body.role ? sanitize(body.role, 80) : null
    const location = body.location ? sanitize(body.location, 80) : null
    const parentId = body.parentId ? sanitize(body.parentId, 80) : null

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name min 2 characters.' }, { status: 400 })
    }
    if (!message || message.length < 3) {
      return NextResponse.json({ error: 'Message min 3 characters.' }, { status: 400 })
    }

    if (parentId) {
      const parent = await db.guestbook.findUnique({ where: { id: parentId } })
      if (!parent) return NextResponse.json({ error: 'Parent entry not found.' }, { status: 404 })
      if (parent.parentId) return NextResponse.json({ error: 'Can only reply to top-level entries.' }, { status: 400 })
    }

    const entry = await db.guestbook.create({
      data: { name, message, role, location, parentId },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('Guestbook POST error:', err)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await rateLimit(`guestbook-like:${ipFrom(req)}`, 10, 60000))) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const id = sanitize(body.id, 80)
    const action = sanitize(body.action, 20)

    if (!id) return NextResponse.json({ error: 'ID required.' }, { status: 400 })

    const existing = await db.guestbook.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 })

    const delta = action === 'unlike' ? -1 : 1
    const newLikes = Math.max(0, existing.likes + delta)

    const updated = await db.guestbook.update({
      where: { id },
      data: { likes: newLikes },
    })

    return NextResponse.json({ likes: updated.likes })
  } catch (err) {
    console.error('Guestbook PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update like.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const id = sanitize(body.id, 80)

    if (!id) return NextResponse.json({ error: 'ID required.' }, { status: 400 })
    if (!adminAuth(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    await db.guestbook.deleteMany({ where: { OR: [{ id }, { parentId: id }] } })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Guestbook DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete entry.' }, { status: 500 })
  }
}
