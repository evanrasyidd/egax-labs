import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

function ipFrom(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`track:${ipFrom(req)}`, 5, 60000)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }
    const date = todayKey()

    const existing = await db.dailyStat.findUnique({ where: { date } })

    if (existing) {
      await db.dailyStat.update({
        where: { date },
        data: { visitors: existing.visitors + 1 },
      })
    } else {
      await db.dailyStat.create({
        data: { date, visitors: 1, views: 1 },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
