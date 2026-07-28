import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function GET() {
  try {
    const days = await db.dailyStat.findMany({
      orderBy: { date: 'desc' },
      take: 7,
    })

    const chart = days.reverse().map(d => {
      const dt = new Date(d.date)
      return {
        day: DAY_NAMES[dt.getDay()],
        sessions: d.visitors,
        views: d.views,
      }
    })

    const totalVisitors = await db.dailyStat.aggregate({ _sum: { visitors: true } })
    const totalViews = await db.dailyStat.aggregate({ _sum: { views: true } })

    return NextResponse.json({
      chart,
      totals: {
        visitors: totalVisitors._sum.visitors ?? 0,
        views: totalViews._sum.views ?? 0,
        trackedDays: days.length,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to get traffic' }, { status: 500 })
  }
}
