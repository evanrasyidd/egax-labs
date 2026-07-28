import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, ipFrom } from '@/lib/rate-limit'
import { sanitize } from '@/lib/sanitize'

export async function POST(req: NextRequest) {
  try {
    if (!(rateLimit(`contact:${ipFrom(req)}`, 3, 60000))) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 })
    }

    const body = await req.json()
    const name = sanitize(body.name, 80)
    const email = sanitize(body.email, 120)
    const subject = sanitize(body.subject, 120)
    const message = sanitize(body.message, 2000)

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter.' }, { status: 400 })
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Format email gak valid.' }, { status: 400 })
    }
    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: 'Subject minimal 3 karakter.' }, { status: 400 })
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: 'Pesan minimal 10 karakter.' }, { status: 400 })
    }

    const entry = await db.contactMessage.create({
      data: { name, email, subject, message },
    })

    return NextResponse.json({ ok: true, id: entry.id }, { status: 201 })
  } catch (err) {
    console.error('Contact POST error:', err)
    return NextResponse.json({ error: 'Gagal kirim pesan.' }, { status: 500 })
  }
}
