# Project Continuity Log

## 27 Jul 2026 Migrated SQLite → Neon (PostgreSQL) + comment replies

### What was done
- **Database migration**: SQLite (`prisma/db/custom.db`) → PostgreSQL on Neon serverless
- **Prisma schema**: changed `provider` from `sqlite` to `postgresql`, added `parentId` + self-relation on `BlogComment` for nested replies
- **db.ts**: replaced raw `PrismaClient` with `PrismaNeon` adapter from `@prisma/adapter-neon`
- **Blog comments**: added rate limiting (5/min), nested reply support in API (GET returns tree structure, POST accepts `parentId`, DELETE for admin moderation)
- **Blog UI**: added inline reply form under each comment, nested replies displayed with indentation + left border
- **Guestbook API**: added DELETE endpoint (admin only, validated via `ADMIN_SECRET`)
- **i18n**: added `cancel` (common) and `replyLabel` (guestbook) keys
- **Seed**: data pushed to Neon (4 projects, 4 stats)
- **About page**: stack updated (SQLite → PostgreSQL/Neon)

### Key decisions
- Used `@prisma/adapter-neon` instead of raw connection handles serverless pooling automatically
- Used pooled Neon URL for runtime (`-pooler`), direct URL for migrations
- Replies only allowed on top-level comments (no nested reply chains) to keep UI simple
- Admin delete uses `ADMIN_SECRET` env var sent in request body set this in Vercel env vars
- Two `.env` URLs: `DATABASE_URL` (pooled, for app) + `DIRECT_URL` (direct, for migrations)

### What's still pending
- Set `DATABASE_URL`, `DIRECT_URL`, and `ADMIN_SECRET` in Vercel environment variables before deploy
- Old SQLite db file removed from project (already gitignored)

### Manage page
- Added `/manage` route to custom router accessed by typing URL directly (not in sidebar)
- Protected by PIN prompt on first load (stored in sessionStorage)
- Shows all guestbook entries with search + delete
- Shows all blog comments grouped by post, with inline reply form + delete
- Name auto-set to "Evan Rasyid Ega Pratama" when replying (badge "Author" shown)
- Refresh button to reload data from API

### Relevant files
- `prisma/schema.prisma` PostgreSQL provider + BlogComment parentId/replies
- `src/lib/db.ts` Neon adapter setup
- `src/app/api/blog-comments/route.ts` rate limit + reply + delete + ?all=true
- `src/app/api/guestbook/route.ts` admin delete endpoint
- `src/components/portfolio/pages/blog.tsx` nested comment UI with reply form
- `src/components/portfolio/pages/manage.tsx` admin management page
- `src/components/portfolio/router.tsx` added `manage` route
- `.env` DATABASE_URL + DIRECT_URL + ADMIN_SECRET

## 22 Jul 2026 FloatingIconsHero integrated into home page

### What was done
- **FloatingIconsHero** (21st.dev sourced) fully integrated into home.tsx replaces old FloatingTechBg hero with mouse-repelling floating SVG icons
- Created `/components/ui/floating-icons.tsx` 12 abstract tech-themed SVG icon components (Hex, Atom, Wave, Grid, Crosshair, Nodes, Pulse, Diamond, Cross, Bracket, Star, Circle)
- Cleaned up old FloatingTechBg function and unused imports (`fadeUp`, `InteractiveButton`, `TechIcon`)
- Removed interactive-button.tsx import (no longer used in home)

### Key decisions
- Used `onCtaClick` prop (not `ctaHref`) so button stays within SPA navigation via `navigate('experiments')`
- SVG icons are abstract/symbolic (not brand logos) to maintain the "lab/experiment" aesthetic
- Icon positions distributed across the hero viewport using top/left/bottom/right percentage

### What's still pending
- (none immediately home page hero is now fully replaced)

### Relevant files
- `src/components/portfolio/pages/home.tsx` FloatingIconsHero integration, heroIcons array
- `src/components/ui/floating-icons-hero-section.tsx` 21st.dev hero with mouse repel effect
- `src/components/ui/floating-icons.tsx` custom SVG icon components
