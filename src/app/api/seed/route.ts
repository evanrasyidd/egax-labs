import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedPortfolioData } from '@/lib/seed'
import { rateLimit, ipFrom } from '@/lib/rate-limit'
import { adminAuth } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!(rateLimit(`seed:${ipFrom(req)}`, 2, 3600000))) {
      return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 })
    }
    await seedPortfolioData()
    return NextResponse.json({ ok: true, message: 'Seed selesai.' })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ ok: false, error: 'Gagal seed.' }, { status: 500 })
  }
}
