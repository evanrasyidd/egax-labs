'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Eye, Activity, GitCommitHorizontal, Star, GitFork,
  FolderKanban, Medal, MessageSquareHeart, Mail, Binoculars,
  CalendarDays, Boxes, Sparkle, UserRoundPlus, UsersRound,
  Crown, Timer, Braces, Footprints,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '../page-header'
import { persona } from '@/lib/portfolio-data'
import { getViews, type PageViewData } from '@/lib/page-views'
import { usePageTracking } from '@/hooks/use-page-tracking'
import { useTranslation } from '@/lib/i18n/context'

interface GitHubData {
  publicRepos: number; followers: number; following: number
  totalStars: number; totalForks: number
  thisWeekCommits: number; bestDayCommits: number
  topLanguages: { lang: string; count: number }[]
  pinned: { name: string; desc: string; stars: number; forks: number; lang: string }[]
}

interface DashboardData {
  stats: { label: string; value: number; icon: string }[]
  totals: { guestbook: number; messages: number; projects: number; achievements: number }
}

interface WakaTimeData {
  averageDaily: number; totalThisWeek: number
  days: { day: string; hours: number }[]
  live: boolean
}

interface TrafficData {
  chart: { day: string; sessions: number; views: number }[]
  totals: { visitors: number; views: number; trackedDays: number }
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        const duration = 1200; const start = performance.now()
        const animate = (t: number) => {
          const p = Math.min((t - start) / duration, 1)
          setDisplay(value * (1 - Math.pow(1 - p, 3)))
          if (p < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      }
    }, { threshold: 0.3 })
    obs.observe(el); return () => obs.disconnect()
  }, [value])

  return <span ref={ref}>{display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
      <Card className="border-border/60"><CardContent className="p-4">
        <Icon className={`mb-1.5 h-4 w-4 ${color}`} />
        <div className="text-xl font-bold tabular-nums"><AnimatedNumber value={value} /></div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </CardContent></Card>
    </motion.div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const [gh, setGh] = React.useState<GitHubData | null>(null)
  const [dash, setDash] = React.useState<DashboardData | null>(null)
  const [waka, setWaka] = React.useState<WakaTimeData | null>(null)
  const [traffic, setTraffic] = React.useState<TrafficData | null>(null)
  const [loading, setLoading] = React.useState(true)

  usePageTracking('dashboard')

  React.useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/github').then(r => r.json()),
      fetch('/api/wakatime').then(r => r.json()),
      fetch('/api/traffic').then(r => r.json()),
    ]).then(([d, g, w, t]) => {
      if (cancelled) return
      if (!d.error) setDash(d)
      if (!g.error) setGh(g)
      if (!w.error) setWaka(w)
      if (!t.error) setTraffic(t)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="py-8 sm:py-12">
      <PageHeader title={t.dashboard.pageTitle} description={t.dashboard.pageDesc} />

      <div className="space-y-8">
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{t.dashboard.overview}</h2>
            <p className="text-xs text-muted-foreground">{t.dashboard.overviewDesc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-border/60"><CardContent className="p-4">
                <div className="mb-2 h-4 w-4 animate-pulse rounded bg-muted/40" />
                <div className="mb-1 h-6 w-16 animate-pulse rounded bg-muted/40" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
              </CardContent></Card>
            )) : (
              <>
                <StatCard icon={FolderKanban} label={t.dashboard.projects} value={dash?.totals.projects ?? 0} color="text-blue-500" />
                <StatCard icon={Medal} label={t.dashboard.achievements} value={dash?.totals.achievements ?? 0} color="text-amber-500" />
                <StatCard icon={MessageSquareHeart} label={t.dashboard.guestbook} value={dash?.totals.guestbook ?? 0} color="text-emerald-500" />
                <StatCard icon={Mail} label={t.dashboard.messages} value={dash?.totals.messages ?? 0} color="text-purple-500" />
                <StatCard icon={Binoculars} label={t.dashboard.visitors} value={traffic?.totals.visitors ?? 0} color="text-rose-500" />
                <StatCard icon={CalendarDays} label={t.dashboard.trackedDays} value={traffic?.totals.trackedDays ?? 0} color="text-cyan-500" />
              </>
            )}
          </div>

          {!loading && traffic && traffic.chart.length > 0 && (
            <Card className="mt-3 overflow-hidden border-border/60">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t.dashboard.trafficTrends}</h3>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> {t.dashboard.trafficVisitors}</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t.dashboard.trafficViews}</span>
                  </div>
                </div>
                <TrafficChart data={traffic.chart} />
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{t.dashboard.activity}</h2>
            <p className="text-xs text-muted-foreground">{t.dashboard.activityDesc}</p>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">@</span>
            <a href={`https://github.com/${persona.githubUser}`} target="_blank" rel="noopener noreferrer" className="font-mono font-medium text-primary hover:underline">{persona.githubUser}</a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {loading ? Array.from({ length: 7 }).map((_, i) => (
              <Card key={i} className="border-border/60"><CardContent className="p-4">
                <div className="mb-2 h-4 w-4 animate-pulse rounded bg-muted/40" />
                <div className="mb-1 h-6 w-12 animate-pulse rounded bg-muted/40" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted/40" />
              </CardContent></Card>
            )) : (
              <>
                <StatCard icon={Boxes} label={t.dashboard.repos} value={gh?.publicRepos ?? 0} color="text-blue-500" />
                <StatCard icon={Sparkle} label={t.dashboard.stars} value={gh?.totalStars ?? 0} color="text-amber-500" />
                <StatCard icon={GitFork} label={t.dashboard.forks} value={gh?.totalForks ?? 0} color="text-emerald-500" />
                <StatCard icon={UserRoundPlus} label={t.dashboard.followers} value={gh?.followers ?? 0} color="text-purple-500" />
                <StatCard icon={UsersRound} label={t.dashboard.following} value={gh?.following ?? 0} color="text-rose-500" />
                <StatCard icon={GitCommitHorizontal} label={t.dashboard.thisWeek} value={gh?.thisWeekCommits ?? 0} color="text-cyan-500" />
                <StatCard icon={Crown} label={t.dashboard.bestDay} value={gh?.bestDayCommits ?? 0} color="text-orange-500" />
              </>
            )}
          </div>

          {!loading && gh?.topLanguages && gh.topLanguages.length > 0 && (
            <Card className="mt-3 overflow-hidden border-border/60">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Braces className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{t.dashboard.topLanguages}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gh.topLanguages.map(l => (
                    <Badge key={l.lang} variant="secondary" className="text-xs">
                      {l.lang} <span className="ml-1 text-muted-foreground">({l.count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && gh?.pinned && gh.pinned.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {gh.pinned.map((r, idx) => (
                <motion.div key={r.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: idx * 0.04 }}>
                  <Card className="group h-full border-border/60 transition-colors hover:border-primary/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <a href={`https://github.com/${persona.githubUser}/${r.name}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                          {persona.githubUser}/{r.name}
                        </a>
                        <Badge variant="outline" className="text-[10px]">{r.lang}</Badge>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{r.desc || 'No description'}</p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{r.stars}</span>
                        <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{r.forks}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Timer className="h-4 w-4 text-primary" /> {t.dashboard.wakatime}
                <Badge variant="outline" className="text-[10px] font-normal ml-1">
                  {waka?.live ? t.dashboard.live : t.dashboard.demo}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">{t.dashboard.wakatimeDesc}</p>
            </div>
            <Card className="overflow-hidden border-border/60"><CardContent className="p-5">
              {loading ? (
                <div className="h-32 animate-pulse rounded bg-muted/40" />
              ) : (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                    <div><div className="text-[11px] text-muted-foreground">{t.dashboard.wakatimeAvg}</div><div className="text-lg font-bold tabular-nums"><AnimatedNumber value={waka?.averageDaily ?? 0} decimals={1} />h</div></div>
                    <div><div className="text-[11px] text-muted-foreground">{t.dashboard.wakatimeTotal}</div><div className="text-lg font-bold tabular-nums"><AnimatedNumber value={waka?.totalThisWeek ?? 0} decimals={1} />h</div></div>
                  </div>
                  {waka?.days && <WakaChart data={waka.days} />}
                </>
              )}
            </CardContent></Card>
          </section>
        </div>

        <VisitStatsSection t={t} />
      </div>
    </div>
  )
}

function TrafficChart({ data }: { data: { day: string; sessions: number; views: number }[] }) {
  const max = Math.max(...data.map(d => Math.max(d.sessions, d.views)), 1)
  return (
    <div className="flex h-44 items-end justify-between gap-2 sm:gap-4">
      {data.map((d, i) => (
        <div key={d.day + i} className="group flex flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 flex-col justify-end gap-0.5">
            <motion.div initial={{ height: 0 }} whileInView={{ height: `${(d.views / max) * 100}%` }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }} className="w-full rounded-t bg-emerald-500/60" />
            <motion.div initial={{ height: 0 }} whileInView={{ height: `${(d.sessions / max) * 100}%` }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }} className="w-full rounded-t bg-blue-500" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function WakaChart({ data }: { data: { day: string; hours: number }[] }) {
  const max = Math.max(...data.map(d => d.hours), 1)
  return (
    <div className="flex h-32 items-end justify-between gap-2">
      {data.map((d, i) => (
        <div key={d.day + i} className="group flex flex-1 flex-col items-center gap-1.5">
          <div className="relative flex w-full flex-1 items-end">
            <motion.div initial={{ height: 0 }} whileInView={{ height: `${(d.hours / max) * 100}%` }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative w-full rounded-t bg-primary/60">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">{d.hours}h</span>
            </motion.div>
          </div>
          <span className="text-[10px] text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

function VisitStatsSection({ t }: { t: ReturnType<typeof useTranslation>['t'] }) {
  const [views, setViews] = React.useState<PageViewData | null>(null)
  React.useEffect(() => { setViews(getViews()) }, [])

  if (!views) return (
    <section><Card className="overflow-hidden border-border/60"><CardContent className="p-5"><div className="h-24 animate-pulse rounded bg-muted/40" /></CardContent></Card></section>
  )

  const sessionDuration = Math.round((Date.now() - new Date(views.sessionStart).getTime()) / 60000)
  const topRoutes = Object.entries(views.perRoute).sort(([, a], [, b]) => b - a).slice(0, 5)
  const maxViews = topRoutes.length > 0 ? topRoutes[0][1] : 1
  const routeColors: Record<string, string> = { home: 'bg-blue-500', about: 'bg-emerald-500', playground: 'bg-amber-500', experiments: 'bg-violet-500', dashboard: 'bg-cyan-500', guestbook: 'bg-teal-500', contact: 'bg-rose-500', links: 'bg-orange-500' }

  return (
    <section>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Footprints className="h-4 w-4 text-primary" /> {t.dashboard.yourVisit}</h2>
        <p className="text-xs text-muted-foreground">{t.dashboard.yourVisitDesc}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-3 gap-3 lg:col-span-1">
          <Card className="border-border/60"><CardContent className="p-4">
            <Eye className="mb-1.5 h-4 w-4 text-blue-500" /><div className="text-xl font-bold tabular-nums">{views.totalViews}</div><div className="text-[11px] text-muted-foreground">{t.dashboard.totalViews}</div>
          </CardContent></Card>
          <Card className="border-border/60"><CardContent className="p-4">
            <Activity className="mb-1.5 h-4 w-4 text-emerald-500" /><div className="text-xl font-bold tabular-nums">{Object.keys(views.perRoute).length}</div><div className="text-[11px] text-muted-foreground">{t.dashboard.pages}</div>
          </CardContent></Card>
          <Card className="border-border/60"><CardContent className="p-4">
            <Timer className="mb-1.5 h-4 w-4 text-amber-500" /><div className="text-xl font-bold tabular-nums">{sessionDuration}</div><div className="text-[11px] text-muted-foreground">{t.dashboard.sessionMin}</div>
          </CardContent></Card>
        </div>
        <Card className="overflow-hidden border-border/60 lg:col-span-2"><CardContent className="p-5">
          <h3 className="mb-4 text-sm font-semibold">{t.dashboard.pagesVisited}</h3>
          {topRoutes.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">{t.dashboard.noVisits}</p>
          ) : (
            <div className="space-y-2.5">
              {topRoutes.map(([route, count]) => (
                <div key={route} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium capitalize text-foreground/80">{route}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(count / maxViews) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${routeColors[route] ?? 'bg-primary'}`} />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent></Card>
      </div>
    </section>
  )
}
