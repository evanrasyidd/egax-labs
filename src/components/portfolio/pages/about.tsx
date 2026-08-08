'use client'

import * as React from 'react'
import { type ComponentType } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FolderOpen, FileJson, FileType, FileText, Globe, Palette, Terminal, Cpu, Book, Gamepad2, Gauge, Mail, Link } from 'lucide-react'
import { featuredExperiments, blogPosts, navLinks } from '@/lib/portfolio-data'
import { useTranslation } from '@/lib/i18n/context'
import { CountUp, TextReveal } from '@/components/animations'
import {
  TreeProvider, TreeView, TreeNode, TreeNodeTrigger,
  TreeNodeContent, TreeExpander, TreeIcon, TreeLabel,
} from '@/components/kibo-ui/tree'

interface TreeItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  children?: TreeItem[]
}

const projectStructure: TreeItem[] = [
  {
    id: 'app', label: 'src/app', icon: Globe,
    children: [
      { id: 'routes', label: '[[...slug]]/page.tsx', icon: FileType },
      { id: 'layout', label: 'layout.tsx', icon: FileType },
      { id: 'globals', label: 'globals.css', icon: FileText },
      { id: 'not-found', label: 'not-found.tsx', icon: FileType },
      {
        id: 'api', label: 'api/', icon: FolderOpen,
        children: [
          { id: 'api-health', label: 'route.ts', icon: FileType },
          { id: 'api-blog-comments', label: 'blog-comments/route.ts', icon: FileType },
          { id: 'api-blog-reactions', label: 'blog-reactions/route.ts', icon: FileType },
          { id: 'api-blog-views', label: 'blog-views/route.ts', icon: FileType },
          { id: 'api-contact', label: 'contact/route.ts', icon: FileType },
          { id: 'api-dashboard', label: 'dashboard/route.ts', icon: FileType },
          { id: 'api-feed', label: 'feed.xml/route.ts', icon: FileType },
          { id: 'api-github', label: 'github/route.ts', icon: FileType },
          { id: 'api-guestbook', label: 'guestbook/route.ts', icon: FileType },
          { id: 'api-og', label: 'og/route.tsx', icon: FileType },
          { id: 'api-search', label: 'search/route.ts', icon: FileType },
          { id: 'api-seed', label: 'seed/route.ts', icon: FileType },
          { id: 'api-track', label: 'track/route.ts', icon: FileType },
          { id: 'api-traffic', label: 'traffic/route.ts', icon: FileType },
          { id: 'api-wakatime', label: 'wakatime/route.ts', icon: FileType },
        ],
      },
      { id: 'sitemap', label: 'sitemap.xml/route.ts', icon: FileType },
    ],
  },
  {
    id: 'components', label: 'src/components', icon: Palette,
    children: [
      {
        id: 'kibo-ui', label: 'kibo-ui/', icon: FolderOpen,
        children: [
              { id: 'tree', label: 'tree/index.tsx', icon: FileType },
          { id: 'pill', label: 'pill/', icon: FolderOpen },
        ],
      },
      {
        id: 'portfolio', label: 'portfolio/', icon: FolderOpen,
        children: [
          { id: 'pf-pages', label: 'pages/', icon: FolderOpen },
          { id: 'pf-command', label: 'command-palette.tsx', icon: FileType },
          { id: 'pf-footer', label: 'footer.tsx', icon: FileType },
          { id: 'pf-global-search', label: 'global-search.tsx', icon: FileType },
          { id: 'pf-search-layer', label: 'global-search-layer.tsx', icon: FileType },
          { id: 'pf-lang', label: 'language-toggle.tsx', icon: FileType },
          { id: 'pf-header', label: 'page-header.tsx', icon: FileType },
          { id: 'pf-skeleton', label: 'page-skeleton.tsx', icon: FileType },
          { id: 'pf-router', label: 'router.tsx', icon: FileType },
          { id: 'pf-view', label: 'router-view.tsx', icon: FileType },
          { id: 'pf-scroll', label: 'scroll-progress.tsx', icon: FileType },
          { id: 'pf-shortcuts-help', label: 'shortcuts-help.tsx', icon: FileType },
          { id: 'pf-shortcuts', label: 'shortcuts-layer.tsx', icon: FileType },
          { id: 'pf-sidebar', label: 'sidebar.tsx', icon: FileType },
          { id: 'pf-scatter', label: 'skill-scatter.tsx', icon: FileType },
          { id: 'pf-tech-icon', label: 'tech-icon.tsx', icon: FileType },
          { id: 'pf-theme-provider', label: 'theme-provider.tsx', icon: FileType },
          { id: 'pf-theme-toggle', label: 'theme-toggle.tsx', icon: FileType },
        ],
      },
      {
        id: 'ui', label: 'ui/', icon: FolderOpen,
        children: [
          { id: 'ui-badge', label: 'badge.tsx', icon: FileType },
          { id: 'ui-button', label: 'button.tsx', icon: FileType },
          { id: 'ui-card', label: 'card.tsx', icon: FileType },
          { id: 'ui-command', label: 'command.tsx', icon: FileType },
          { id: 'ui-dialog', label: 'dialog.tsx', icon: FileType },
          { id: 'ui-dropdown', label: 'dropdown-menu.tsx', icon: FileType },
          { id: 'ui-input', label: 'input.tsx', icon: FileType },
          { id: 'ui-interactive', label: 'interactive-button.tsx', icon: FileType },
          { id: 'ui-scroll', label: 'scroll-area.tsx', icon: FileType },
          { id: 'ui-sheet', label: 'sheet.tsx', icon: FileType },
          { id: 'ui-sonner', label: 'sonner.tsx', icon: FileType },
          { id: 'ui-textarea', label: 'textarea.tsx', icon: FileType },
          { id: 'ui-tilt', label: 'tilt-card.tsx', icon: FileType },
          { id: 'ui-toast', label: 'toast.tsx', icon: FileType },
          { id: 'ui-toaster', label: 'toaster.tsx', icon: FileType },
        ],
      },
      {
        id: 'animations', label: 'animations/', icon: FolderOpen,
        children: [
          { id: 'anim-index', label: 'index.tsx', icon: FileType },
        ],
      },
      {
        id: 'playground', label: 'playground/', icon: FolderOpen,
        children: [
          { id: 'play-snake', label: 'snake.tsx', icon: FileType },
          { id: 'play-asteroids', label: 'asteroids.tsx', icon: FileType },
          { id: 'play-flappy', label: 'flappy-bird.tsx', icon: FileType },
          { id: 'play-tetris', label: 'tetris.tsx', icon: FileType },
          { id: 'play-mario', label: 'dino-run.tsx', icon: FileType },
          { id: 'play-pong', label: 'pong.tsx', icon: FileType },
        ],
      },
      { id: 'error-boundary', label: 'error-boundary.tsx', icon: FileType },
    ],
  },
  {
    id: 'lib', label: 'src/lib', icon: Book,
    children: [
      { id: 'lib-db', label: 'db.ts', icon: FileType },
      { id: 'lib-utils', label: 'utils.ts', icon: FileType },
      { id: 'lib-data', label: 'portfolio-data.ts', icon: FileJson },
      { id: 'lib-pages', label: 'page-views.ts', icon: FileType },
      { id: 'lib-rate-limit', label: 'rate-limit.ts', icon: FileType },
      { id: 'lib-seed', label: 'seed.ts', icon: FileType },
      {
        id: 'lib-i18n', label: 'i18n/', icon: FolderOpen,
        children: [
          { id: 'i18n-context', label: 'context.tsx', icon: FileType },
          { id: 'i18n-en', label: 'en.ts', icon: FileJson },
          { id: 'i18n-id', label: 'id.ts', icon: FileJson },
          { id: 'i18n-types', label: 'types.ts', icon: FileType },
        ],
      },
    ],
  },
  {
    id: 'hooks', label: 'src/hooks', icon: Terminal,
    children: [
      { id: 'hook-tracking', label: 'use-page-tracking.ts', icon: FileType },
      { id: 'hook-toast', label: 'use-toast.ts', icon: FileType },
    ],
  },
  {
    id: 'prisma', label: 'prisma/', icon: Cpu,
    children: [
      { id: 'schema', label: 'schema.prisma', icon: FileType },
    ],
  },
  {
    id: 'public', label: 'public/', icon: Globe,
    children: [
      { id: 'manifest', label: 'manifest.json', icon: FileJson },
      { id: 'icon', label: 'icon.svg', icon: FileText },
    ],
  },
]

const stack = [
  { layer: 'Frontend', items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion'] },
  { layer: 'UI', items: ['shadcn/ui', 'Radix UI', 'Lucide Icons'] },
  { layer: 'Data', items: ['Prisma ORM', 'PostgreSQL (Neon)', 'Zod Validation'] },
  { layer: 'Infra', items: ['Vercel', 'GitHub Actions'] },
]

const layerColors: Record<string, string> = {
  Frontend: 'border-t-cyan-500/40 bg-cyan-500/5',
  UI: 'border-t-violet-500/40 bg-violet-500/5',
  Data: 'border-t-emerald-500/40 bg-emerald-500/5',
  Infra: 'border-t-amber-500/40 bg-amber-500/5',
}

const layerDotColors: Record<string, string> = {
  Frontend: 'bg-cyan-500',
  UI: 'bg-violet-500',
  Data: 'bg-emerald-500',
  Infra: 'bg-amber-500',
}

function TreeNodeRenderer({ node, level = 0 }: { node: TreeItem; level?: number }) {
  const Icon = node.icon
  const hasChildren = !!node.children?.length

  return (
    <TreeNode nodeId={node.id} level={level}>
      <TreeNodeTrigger>
        <TreeExpander hasChildren={hasChildren} />
        <TreeIcon hasChildren={hasChildren} icon={<Icon className="h-4 w-4" />} />
        <TreeLabel>{node.label}</TreeLabel>
      </TreeNodeTrigger>
      {hasChildren && (
        <TreeNodeContent hasChildren>
          {node.children!.map((child, i) => (
            <TreeNodeRenderer
              key={child.id}
              node={child}
              level={level + 1}
            />
          ))}
        </TreeNodeContent>
      )}
    </TreeNode>
  )
}

export function AboutPage({ projects = [] }: { projects?: { id: string }[] }) {
  const { t } = useTranslation()
  const projectCount = projects.length

  const stats = [
    { key: 'statProjects', value: projectCount },
    { key: 'statExperiments', value: featuredExperiments.length },
    { key: 'statDevlogs', value: blogPosts.length },
    { key: 'statPages', value: navLinks.length },
  ] as const

  return (
    <div className="py-8 sm:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 40, damping: 14 }}
        className="mb-16 text-center"
      >
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          <TextReveal text={t.about.pageTitle} />
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          {t.about.pageDesc}
        </p>
        <div className="mx-auto mt-6 h-px w-16 bg-border" />
      </motion.div>

      {/* Manifesto */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 40, damping: 15 }}
        className="mb-16 border-l-2 border-primary/40 pl-6 sm:pl-8"
      >
        <p className="text-balance text-base leading-relaxed text-foreground/90 sm:text-lg">
          {t.about.purposeDesc}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          &mdash; {t.about.purpose}
        </p>
      </motion.div>

      {/* Architecture Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 40, damping: 15, delay: 0.1 }}
        className="mb-16"
      >
        <h2 className="mb-2 text-lg font-bold tracking-tight">{t.about.architecture}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t.about.architectureDesc}</p>

        <div className="relative space-y-0">
          {stack.map((s, idx) => (
            <motion.div
              key={s.layer}
              initial={{ opacity: 0, x: -12, filter: 'blur(3px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 16,
                delay: idx * 0.08,
              }}
            >
              <div className={`relative border-t-2 ${layerColors[s.layer]} rounded-lg px-4 py-3 sm:px-5`}>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${layerDotColors[s.layer]}`} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.layer}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.items.map((item, i) => (
                    <span
                      key={item}
                      className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                        layerColors[s.layer].replace('bg-', 'border-').replace('/5', '/20')
                          ? `border-border/40 bg-muted/30 text-foreground/80`
                          : 'border-border/40 bg-muted/30 text-foreground/80'
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
                {idx < stack.length - 1 && (
                  <div className="absolute -bottom-3 left-6">
                    <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Project Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 40, damping: 15, delay: 0.15 }}
        className="mb-16"
      >
        <h2 className="mb-2 text-lg font-bold tracking-tight">Project Structure</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Hierarki folder project ini component library, pages, API routes, dan utility modules.
        </p>

        <div className="rounded-xl border border-border/60 bg-card/50 p-1">
          <TreeProvider defaultExpandedIds={['app', 'components', 'lib']} showLines showIcons animateExpand>
            <TreeView>
              {projectStructure.map((node) => (
                <TreeNodeRenderer key={node.id} node={node} />
              ))}
            </TreeView>
          </TreeProvider>
        </div>
      </motion.div>

      {/* Site Stats minimal row */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ type: 'spring', stiffness: 45, damping: 15 }}
        className="mb-16"
      >
        <h2 className="mb-2 text-lg font-bold tracking-tight">{t.about.siteStats}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t.about.siteStatsDesc}</p>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.key}
              className="flex flex-col items-center gap-1 bg-card py-6 text-center"
            >
              <span className="text-3xl font-bold tracking-tight">
                <CountUp target={s.value} />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {t.about[s.key]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Colophon */}
      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(2px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ type: 'spring', stiffness: 45, damping: 16 }}
        className="border-t border-border/40 pt-8 text-center text-xs leading-relaxed text-muted-foreground"
      >
        <p className="text-pretty">{t.about.colophonDesc}</p>
      </motion.div>
    </div>
  )
}
