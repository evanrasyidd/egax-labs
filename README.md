# Evan Lab Creative Coding Playground

Personal lab and portfolio website built with Next.js. A space for interactive coding experiments, physics simulations, 3D visualization, and creative UI exploration.

## Tech Stack

- **Framework** Next.js 16 (App Router, webpack)
- **Language** TypeScript
- **Styling** Tailwind CSS v4 + tw-animate-css
- **UI** shadcn/ui (Radix primitives)
- **Animation** Framer Motion
- **State** Zustand
- **Forms** React Hook Form + Zod
- **Database** PostgreSQL (Neon serverless) via Prisma
- **Icons** Lucide React

## Features

- **SPA-style navigation** custom router with animated transitions
- **Guestbook** leave messages with reply threads and likes
- **Blog** devlogs with nested comment system
- **Dashboard** live stats from GitHub, Wakatime, and site traffic
- **Playground** pixel games (Tetris, Asteroids, Flappy Bird, etc.)
- **Experiments** interactive physics and 3D demos
- **Manage page** admin panel for guestbook moderation and blog management
- **i18n** Indonesian / English toggle
- **Dark/light theme** system-aware with manual toggle
- **Command palette** `Cmd+K` quick navigation
- **Global search** search across projects, blog posts, and skills
- **OG images** auto-generated social preview images

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, DIRECT_URL, ADMIN_SECRET

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled URL (runtime) |
| `DIRECT_URL` | Neon direct URL (migrations) |
| `ADMIN_SECRET` | Secret for admin endpoints |
| `WAKATIME_API_KEY` | Wakatime API key (optional) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Run Prisma migrations |

## License

MIT
