import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedPortfolioData } from '@/lib/seed'

export async function GET() {
  try {
    // Auto-seed if empty (idempotent)
    const statsCount = await db.siteStats.count()
    if (statsCount === 0) {
      await seedPortfolioData()
    }

    const [stats, projects, achievements, guestbookCount, messageCount] = await Promise.all([
      db.siteStats.findMany(),
      db.project.findMany({ orderBy: { sort: 'asc' } }),
      db.achievement.findMany({ orderBy: { sort: 'asc' } }),
      db.guestbook.count(),
      db.contactMessage.count(),
    ])

    return NextResponse.json({
      stats,
      projects,
      achievements,
      totals: {
        guestbook: guestbookCount,
        messages: messageCount,
        projects: projects.length,
        achievements: achievements.length,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240' },
    })
  } catch (err) {
    console.error('Dashboard GET error:', err)
    return NextResponse.json({ error: 'Gagal ambil data dashboard.' }, { status: 500 })
  }
}
