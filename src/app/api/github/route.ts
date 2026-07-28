import { NextResponse } from 'next/server'

interface GitHubUser {
  public_repos: number
  followers: number
  following: number
}

interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
}

interface GitHubCommitItem {
  commit: { committer: { date: string } }
}

function getToday(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const username = 'evanrasyidd'

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, { next: { revalidate: 3600 } }),
    ])

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({ error: 'GitHub API error' }, { status: 502 })
    }

    const user: GitHubUser = await userRes.json()
    const repos: GitHubRepo[] = await reposRes.json()

    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0)
    const totalForks = repos.reduce((acc, r) => acc + r.forks_count, 0)

    const sorted = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)
    const pinned = sorted.slice(0, 6).map(r => ({
      name: r.name,
      desc: r.description ?? '',
      stars: r.stargazers_count,
      forks: r.forks_count,
      lang: r.language ?? 'Unknown',
    }))

    const langCount: Record<string, number> = {}
    repos.forEach(r => {
      if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1
    })
    const topLanguages = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ lang, count }))

    let thisWeekCommits = 0
    let bestDayCommits = 0

    try {
      const thirtyDaysAgo = daysAgo(30)
      const searchRes = await fetch(
        `https://api.github.com/search/commits?q=author:${username}+committer-date:>=${thirtyDaysAgo}&per_page=100&sort=committer-date&order=desc`,
        {
          headers: { Accept: 'application/vnd.github.cloak-preview' },
          next: { revalidate: 3600 },
        }
      )

      if (searchRes.ok) {
        const searchData: { items: GitHubCommitItem[] } = await searchRes.json()
        const today = getToday()
        const oneWeekAgo = daysAgo(7)
        const dayBuckets: Record<string, number> = {}

        for (const item of searchData.items) {
          const date = item.commit.committer.date.slice(0, 10)
          dayBuckets[date] = (dayBuckets[date] || 0) + 1

          if (date >= oneWeekAgo && date <= today) {
            thisWeekCommits++
          }
        }

        bestDayCommits = Math.max(...Object.values(dayBuckets), 0)
      }
    } catch {
    }

    return NextResponse.json({
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      totalStars,
      totalForks,
      thisWeekCommits,
      bestDayCommits,
      topLanguages,
      pinned,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}
