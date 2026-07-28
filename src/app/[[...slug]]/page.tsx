import { db } from '@/lib/db'
import { Sidebar } from '@/components/portfolio/sidebar'

export const revalidate = 86400
import { Footer } from '@/components/portfolio/footer'
import { HomePage } from '@/components/portfolio/pages/home'
import { AboutPage } from '@/components/portfolio/pages/about'
import { AchievementsPage } from '@/components/portfolio/pages/achievements'
import { ProjectsPage } from '@/components/portfolio/pages/projects'
import { DashboardPage } from '@/components/portfolio/pages/dashboard'
import { GuestbookPage } from '@/components/portfolio/pages/guestbook'
import { ContactPage } from '@/components/portfolio/pages/contact'
import { LinksPage } from '@/components/portfolio/pages/links'
import { BlogPage } from '@/components/portfolio/pages/blog'
import { ManagePage } from '@/components/portfolio/pages/manage'
import { RouterView } from '@/components/portfolio/router-view'
import { ScrollProgress } from '@/components/portfolio/scroll-progress'
import { ShortcutsLayer } from '@/components/portfolio/shortcuts-layer'
import { GlobalSearchLayer } from '@/components/portfolio/global-search-layer'

async function getInitialData() {
  try {
    const [projects, guestbookEntries, blogPosts] = await Promise.all([
      db.project.findMany({ orderBy: { sort: 'asc' } }),
      db.guestbook.findMany({
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: 50,
      }),
      db.blogPost.findMany({ orderBy: { sort: 'asc' } }),
    ])

    return {
      projects: projects.map((p) => ({ ...p })),
      guestbookEntries,
      blogPosts: blogPosts.map((p) => ({ ...p, tags: p.tags ? p.tags.split(',') : [] })),
    }
  } catch (err) {
    console.error('getInitialData error:', err)
    return { projects: [], guestbookEntries: [], blogPosts: [] }
  }
}

export default async function Home() {
  const data = await getInitialData()

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <ScrollProgress />
      <ShortcutsLayer />
      <GlobalSearchLayer />
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8">
          <RouterView>
            <HomePage projects={data.projects} />
            <AboutPage projects={data.projects} />
            <AchievementsPage />
            <ProjectsPage projects={data.projects} />
            <DashboardPage />
            <BlogPage initialPosts={data.blogPosts} />
            <GuestbookPage initialEntries={data.guestbookEntries} />
            <ContactPage />
            <LinksPage />
            <ManagePage />
          </RouterView>
        </main>
        <Footer />
      </div>
    </div>
  )
}
