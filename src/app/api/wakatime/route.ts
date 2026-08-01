import { NextResponse } from 'next/server'

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  const apiKey = process.env.WAKATIME_API_KEY

  try {
    if (!apiKey) {
      return NextResponse.json({ averageDaily: 0, totalThisWeek: 0, days: [], live: false })
    }

    const start = new Date()
    start.setDate(start.getDate() - 6)
    const url = `https://wakatime.com/api/v1/users/current/summaries?start=${iso(start)}&end=${iso(new Date())}`

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      return NextResponse.json({ averageDaily: 0, totalThisWeek: 0, days: [], live: false })
    }

    const json = await res.json()
    const daysRaw = json?.data ?? []

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const days = daysRaw.map((d: { range?: { date?: string }; grand_total?: { total_seconds?: number } }) => {
      const dt = d.range?.date ? new Date(d.range.date) : null
      return {
        day: dt ? dayNames[dt.getDay()] : '?',
        hours: Math.round(((d.grand_total?.total_seconds ?? 0) / 3600) * 10) / 10,
      }
    })

    const totalSec = days.reduce((s: number, d: { hours: number }) => s + d.hours, 0) * 3600
    const totalHours = totalSec / 3600
    const avgDaily = totalHours / 7

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
