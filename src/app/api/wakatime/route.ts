import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY

  try {
    if (!apiKey) {
      return NextResponse.json({ averageDaily: 0, totalThisWeek: 0, days: [], live: false })
    }

    const res = await fetch('https://wakatime.com/api/v1/users/current/stats/last_7_days', {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      return NextResponse.json({ averageDaily: 0, totalThisWeek: 0, days: [], live: false })
    }

    const json = await res.json()
    const grandTotal = json?.data?.grand_total
    const daysRaw = json?.data?.days ?? []

    const totalSec = grandTotal?.total_seconds ?? 0
    const avgDaily = totalSec / 7 / 3600
    const totalHours = totalSec / 3600

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = daysRaw.map((d: { date: string; total_seconds: number }) => {
      const dt = new Date(d.date)
      return {
        day: dayNames[dt.getDay()],
        hours: Math.round((d.total_seconds / 3600) * 10) / 10,
      }
    })

    return NextResponse.json({
      averageDaily: Math.round(avgDaily * 10) / 10,
      totalThisWeek: Math.round(totalHours * 10) / 10,
      days,
      live: true,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ averageDaily: 0, totalThisWeek: 0, days: [], live: false })
  }
}
