import type { TechName } from '@/components/portfolio/tech-icon'

export const persona = {
  name: 'Evan Rasyid Ega Pratama',
  firstName: 'Evan',
  role: 'Frontend Engineer & Creative Developer',
  roleFull: 'Frontend Engineer & Creative Developer',
  location: 'Indonesia',
  locationType: 'Remote',
  flag: '🇮🇩',
  email: 'helloegaxdev@gmail.com',
  githubUser: 'evanrasyidd',
  homeIntro: `Frontend Engineer & Creative Developer yang suka bereksperimen dengan interactive coding, physics simulation, 3D visualization, dan UI yang gak biasa. Lab ini tempat documenting semua experiment & creative coding.`,
  aboutParagraphs: [
    `Halo, saya Evan Rasyid Ega Pratama Frontend Engineer & Creative Developer dari Indonesia. Ini lab eksperimen pribadi saya untuk interactive coding, creative UI, physics simulation, 3D visualization, dan hal-hal random lain yang menarik buat dieksplor.`,
    `Semua yang ada di sini dibangun pake Next.js, TypeScript, Three.js, Matter.js, Framer Motion, dan berbagai library keren lainnya. Di luar web, saya juga bisa bangun mobile app pake Flutter, Dart, dan Kotlin. Setiap experiment adalah kesempatan buat belajar sesuatu yang baru.`,
    `Di luar coding, saya aktif di komunitas developer Indonesia, kadang nulis catatan teknis, dan eksperimen dengan berbagai tools buat ningkatin produktivitas. Saya open untuk diskusi, kolaborasi, dan opportunity baru.`,
    `Best regards,`,
  ],
  socials: [
    { label: 'GitHub', url: 'https://github.com/evanrasyidd', icon: 'github', handle: '@evanrasyidd' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/evanrasyidd', icon: 'linkedin', handle: 'Evan Rasyid Ega Pratama' },
    { label: 'Instagram', url: 'https://instagram.com/evanrasyidd', icon: 'instagram', handle: '@evanrasyidd' },
    { label: 'Email', url: 'mailto:helloegaxdev@gmail.com', icon: 'mail', handle: 'helloegaxdev@gmail.com' },
  ],
}

export type SkillCategory = 'Main' | 'Frontend' | 'Backend' | 'Mobile' | 'Database' | 'Tools'

export interface Skill {
  name: string
  category: SkillCategory
  icon: TechName
  color?: string
}

export const skills: Skill[] = [
  { name: 'HTML & CSS', category: 'Main', icon: 'html5', color: '#E34F26' },
  { name: 'JavaScript', category: 'Main', icon: 'javascript', color: '#F7DF1E' },
  { name: 'TypeScript', category: 'Main', icon: 'typescript', color: '#3178C6' },
  { name: 'Tailwind CSS', category: 'Main', icon: 'tailwindcss', color: '#06B6D4' },

  { name: 'React', category: 'Frontend', icon: 'react', color: '#61DAFB' },
  { name: 'Next.js', category: 'Frontend', icon: 'nextdotjs', color: '#000000' },
  { name: 'React Three Fiber', category: 'Frontend', icon: 'threedotjs', color: '#000000' },
  { name: 'WebGL', category: 'Frontend', icon: 'webgl', color: '#990000' },
  { name: 'GSAP', category: 'Frontend', icon: 'greensock', color: '#88CE02' },
  { name: 'Matter.js', category: 'Frontend', icon: 'matterdotjs', color: '#4A90D9' },
  { name: 'Framer Motion', category: 'Frontend', icon: 'framer', color: '#0055FF' },
  { name: 'shadcn/ui', category: 'Frontend', icon: 'shadcnui', color: '#000000' },
  { name: 'Vite', category: 'Frontend', icon: 'vite', color: '#646CFF' },
  { name: 'Redux', category: 'Frontend', icon: 'redux', color: '#764ABC' },
  { name: 'Zustand', category: 'Frontend', icon: 'zustand', color: '#000000' },
  { name: 'React Hook Form', category: 'Frontend', icon: 'reacthookform', color: '#EC5990' },
  { name: 'Lucide', category: 'Frontend', icon: 'lucide', color: '#F56565' },

  { name: 'Flutter', category: 'Mobile', icon: 'flutter', color: '#42D1FF' },
  { name: 'Dart', category: 'Mobile', icon: 'dart', color: '#0175C2' },
  { name: 'Kotlin', category: 'Mobile', icon: 'kotlin', color: '#7F52FF' },

  { name: 'Node.js', category: 'Backend', icon: 'nodedotjs', color: '#83CD29' },
  { name: 'Express', category: 'Backend', icon: 'express', color: '#000000' },
  { name: 'Zod', category: 'Backend', icon: 'zod', color: '#3E67B1' },
  { name: 'Neon', category: 'Backend', icon: 'neon', color: '#00E599' },

  { name: 'Prisma', category: 'Database', icon: 'prisma', color: '#2D3748' },
  { name: 'PostgreSQL', category: 'Database', icon: 'postgresql', color: '#336791' },
  { name: 'MySQL', category: 'Database', icon: 'mysql', color: '#4479A1' },
  { name: 'Firebase', category: 'Database', icon: 'firebase', color: '#FFCA28' },
  { name: 'Supabase', category: 'Database', icon: 'supabase', color: '#3ECF8E' },

  { name: 'Git', category: 'Tools', icon: 'git', color: '#F05032' },
  { name: 'GitHub', category: 'Tools', icon: 'github', color: '#000000' },
  { name: 'Docker', category: 'Tools', icon: 'docker', color: '#2496ED' },
  { name: 'Bun', category: 'Tools', icon: 'bun', color: '#000000' },
  { name: 'Vitest', category: 'Tools', icon: 'vitest', color: '#6E9F18' },
  { name: 'Figma', category: 'Tools', icon: 'figma', color: '#F24E1E' },
  { name: 'Vercel', category: 'Tools', icon: 'vercel', color: '#000000' },
  { name: 'VS Code', category: 'Tools', icon: 'visualstudiocode', color: '#007ACC' },
  { name: 'Npm', category: 'Tools', icon: 'npm', color: '#CB3837' },
  { name: 'Claude', category: 'Tools', icon: 'claude', color: '#D97757' },
  { name: 'OpenCode', category: 'Tools', icon: 'opencode', color: '#000000' },
  { name: 'DeepSeek', category: 'Tools', icon: 'deepseek', color: '#4D6BFE' },
]

export interface CareerItem {
  role: string
  company: string
  location: string
  period: string
  duration: string
  type: string
  mode: string
}

export const career: CareerItem[] = [
  { role: 'Frontend Engineer (Intern)', company: 'Tech Startup', location: 'Jakarta, Indonesia', period: 'Jun 2025 – Present', duration: '6 mos', type: 'Internship', mode: 'Hybrid' },
  { role: 'Freelance Web Developer', company: 'Self-employed', location: 'Indonesia', period: 'Jan 2024 – Present', duration: '2 yrs 6 mos', type: 'Freelance', mode: 'Remote' },
  { role: 'Teaching Assistant Computer Science', company: 'Universitas Indonesia', location: 'Depok, Indonesia', period: 'Aug 2024 – Dec 2024', duration: '5 mos', type: 'Part-time', mode: 'On-site' },
]

export interface EducationItem {
  institution: string
  degree: string
  detail: string
  period: string
  location: string
}

export const education: EducationItem[] = [
  {
    institution: 'Universitas Indonesia',
    degree: "Bachelor's degree",
    detail: 'Computer Science, (S.Kom)',
    period: '2022 - 2026',
    location: 'Indonesia',
  },
]

export interface NavLink {
  label: string
  href: string
  icon: string
}

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'About', href: '/about', icon: 'microscope' },
  { label: 'Playground', href: '/playground', icon: 'gamepad-2' },
  { label: 'Experiments', href: '/experiments', icon: 'flask-conical' },
  { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Devlog', href: '/devlog', icon: 'notebook' },
  { label: 'Guestbook', href: '/guestbook', icon: 'book-open' },
  { label: 'Contact', href: '/contact', icon: 'mail' },
  { label: 'Links', href: '/links', icon: 'link' },
]

export interface SocialLinkCard {
  label: string
  description: string
  url: string
  icon: string
  cta: string
}

export const contactSocials: SocialLinkCard[] = [
  { label: 'Stay in Touch', description: 'Reach out via email for inquiries or collaborations.', url: 'mailto:helloegaxdev@gmail.com', icon: 'mail', cta: 'Go to gmail' },
  { label: 'Follow My Journey', description: 'Follow my creative journey.', url: 'https://instagram.com/evanrasyidd', icon: 'instagram', cta: 'Go to instagram' },
  { label: "Let's Connect", description: 'Connect with me professionally.', url: 'https://linkedin.com/in/evanrasyidd', icon: 'linkedin', cta: 'Go to linkedin' },
  { label: 'Explore the Code', description: 'Explore my open-source work.', url: 'https://github.com/evanrasyidd', icon: 'github', cta: 'Go to github' },
]

export interface LinkTreeItem {
  label: string
  description: string
  url: string
  icon: string
}

export const linkTree: LinkTreeItem[] = [
  { label: 'Personal Portfolio', description: 'Live portfolio & showcase', url: 'https://egaxdev.vercel.app/', icon: 'globe' },
  { label: 'GitHub', description: 'Open source projects & contributions', url: 'https://github.com/evanrasyidd', icon: 'github' },
]

export interface NowItem {
  label: string
  value: string
  detail?: string
  icon: string
  status: 'active' | 'learning' | 'reading' | 'building' | 'listening'
}

export const nowItems: NowItem[] = [
  {
    label: 'Currently building',
    value: 'Creative Lab',
    detail: 'Interactive coding experiments',
    icon: 'hammer',
    status: 'building',
  },
  {
    label: 'Learning',
    value: 'Three.js & WebGL',
    detail: '3D visualization experiments',
    icon: 'book-open',
    status: 'learning',
  },
  {
    label: 'Reading',
    value: 'Atomic Design',
    detail: 'Brad Frost structuring UI systems',
    icon: 'book',
    status: 'reading',
  },
  {
    label: 'Listening to',
    value: 'Phonk & DJ Angkot',
    detail: 'Bass nghentak biar coding makin ngegas',
    icon: 'music',
    status: 'listening',
  },
]

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  date: string
  readTime: string | number
  featured: boolean
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'building-egalog-hris',
    title: 'Building EgaLog Full HRIS with Selfie Attendance & Auto Payroll',
    excerpt: 'How I built a complete HR management system with QR-based attendance, selfie verification, and automated payroll from scratch.',
    content: `## Why EgaLog?

Most small businesses in Indonesia still manage payroll with spreadsheets. Attendance is tracked on paper. Late payroll calculations, wrong deductions, and lost records are the norm. EgaLog started as a solution for one manufacturing client and grew into a full-featured HRIS.

## Architecture

The stack is Next.js App Router for the frontend, Prisma + SQLite for data, and a REST API layer for the mobile check-in flow. The mobile experience is a PWA with camera access for selfie verification.

### Key decisions

- SQLite instead of PostgreSQL because most SMEs don't have a dedicated server setup. File-based DB means backup is just copying a file.
- QR code per shift, not per employee. One QR per room/shift group, employees scan and their assigned shift auto-detects.
- Selfie verification runs a basic similarity check not production-grade facial recognition, but enough to prevent buddy punching.

## The Attendance Flow

The check-in flow goes: scan QR → camera opens → take selfie → selfie compared to stored photo → clock-in timestamp recorded. Check-out follows the same flow. The backend calculates total hours based on shift schedule, including overtime multipliers.

## Payroll Automation

This was the hardest part. Indonesian payroll has many components: basic salary, positional allowance, meal allowance, transport, BPJS Kesehatan, BPJS Ketenagakerjaan, PPh 21, and various deductions. Each company has different rules.

I built a rule engine where admin can define salary components, set whether they're fixed or calculated, and configure tax brackets. The engine runs monthly and generates payslips automatically.

## What I Learned

The biggest lesson was that enterprise features don't need enterprise complexity. A well-structured CRUD with good business logic rules can replace systems that cost millions per year. The key is understanding the domain deeply, not writing clever code.`,
    category: 'Architecture',
    tags: ['Next.js', 'Prisma', 'PWA', 'HRIS'],
    date: '2026-07-15',
    readTime: 6,
    featured: true,
  },
  {
    id: '2',
    slug: 'building-invoicegua',
    title: 'InvoiceGUA Local-First Invoicing PWA for Freelancers',
    excerpt: 'Designing an offline-capable invoicing app that works without internet and syncs when connected.',
    content: `## The Problem

Freelancers in Indonesia send invoices via WhatsApp in PDF or even screenshots of handwritten notes. There's no lightweight tool that works offline, supports Indonesian tax format (PPN), and doesn't require a monthly subscription.

InvoiceGUA is a PWA that lives in your browser. It works offline, stores data in IndexedDB, and syncs to the cloud when you're online.

## Why PWA?

Most freelancers work from coffee shops with spotty internet. A native app requires installation from Play Store, which adds friction. PWA means:

- Open the URL, "Add to Home Screen", done
- Full offline support via Service Worker + IndexedDB
- No app store review cycle
- Smaller install footprint

## Local-First Architecture

The data flow: IndexedDB is the source of truth locally. When the user creates an invoice, it saves to IndexedDB immediately (no loading spinner). A sync engine pushes changes when online and pulls updates from the server.

### Conflict resolution

Last-write-wins for now. The app is single-user per device, so conflicts are rare. Future versions may use CRDT.

## Indonesian Tax Format

PPN (Pajak Pertambahan Nilai) is 11% in Indonesia. The invoice format must show DPP (Dasar Pengenaan Pajak), PPN amount, and total. InvoiceGUA auto-calculates these and generates PDFs that comply with local standards.

## What's Next

The roadmap includes: bank transfer auto-verification via partner API, recurring invoice templates, and integration with e-faktur for PPN reporting.`,
    category: 'PWA',
    tags: ['PWA', 'IndexedDB', 'Next.js', 'Offline-First'],
    date: '2026-07-10',
    readTime: 5,
    featured: true,
  },
  {
    id: '3',
    slug: 'rasga-coffee-studio',
    title: 'RASGA Coffee Studio QR Table-Ordering System',
    excerpt: 'Replacing paper menus with QR-based ordering for a local coffee shop, built with Next.js and real-time updates.',
    content: `## The Context

A specialty coffee shop in Bandung wanted to replace their paper menu system. Customers had to queue at the counter, browse a physical menu, and remember their order. During peak hours, the counter bottleneck caused long wait times.

RASGA Coffee Studio is a digital ordering system where customers scan a QR code on their table, browse the menu on their phone, and order directly. The kitchen receives orders in real-time.

## Tech Stack

- Next.js App Router for the frontend
- Prisma + SQLite for data
- SSE (Server-Sent Events) for real-time order updates
- Tailwind CSS with a warm, coffee-themed design

## The Order Flow

Customer scans QR → menu loads in browser → adds items to cart → submits order → kitchen receives notification → drinks prepared → status updates pushed via SSE → customer sees "ready for pickup" on their screen.

### Why not WebSocket?

For this use case, SSE is simpler. Orders are one-directional (kitchen needs to know), and the kitchen doesn't need to send complex commands back. SSE auto-reconnects, works over HTTP/2, and doesn't need a separate WebSocket server.

## Admin Dashboard

The admin panel shows live orders, daily revenue, popular items, and inventory alerts. Built as a separate route with simple auth (PIN-based, no email/password overhead for a small shop).

## Lessons Learned

SSE works great for this use case but has connection limits per browser. For a single coffee shop with ~30 tables, it's fine. For larger deployments, I'd switch to WebSocket or use a real-time service.

The hardest part was not technical it was mapping the coffee shop's workflow into the system. Every shop has slightly different procedures (prepay vs postpay, self-service vs waiter service). The system needed to be configurable, not hardcoded.`,
    category: 'Web App',
    tags: ['Next.js', 'SSE', 'Prisma', 'Real-Time'],
    date: '2026-07-05',
    readTime: 5,
    featured: true,
  },
  {
    id: '4',
    slug: 'egax-studios-ecommerce',
    title: 'EGAX Studios Fashion E-Commerce with 3D Showcase',
    excerpt: 'Building an online fashion store with interactive 3D product viewer and integrated POS system for offline sales.',
    content: `## Project Scope

EGAX Studios is a fashion brand that needed two things: an online store for their customers and a POS system for their physical pop-up events. The challenge was building one system that serves both channels with unified inventory.

## The 3D Product Viewer

Clothing looks different on a flat photo than in real life. The 3D viewer lets customers rotate products, zoom into fabric texture, and see how garments drape. Built with React Three Fiber, models are processed from standard fashion photography.

### Performance Trade-offs

High-poly models look great but kill load times. The solution was:
- GLTF compressed with Draco
- Progressive loading: low-poly placeholder → high-detail on interaction
- LOD (Level of Detail) that reduces polygon count when the model is far from camera

## POS Integration

The POS runs in the same Next.js app, authenticated via a different role. When a sale happens at a pop-up event, it deducts from the same inventory as online orders. This prevents overselling.

The POS interface is optimized for tablet with large touch targets and barcode scanning support.

## Inventory Sync

Real-time inventory across online + offline required careful locking. I used optimistic concurrency with Prisma transactions. When two cashiers scan the same item simultaneously, the second one sees "already sold" before completing the transaction.

## What I'd Do Differently

The monolith approach (Next.js handles both web store and POS) worked for MVP but should be split if the business grows. The POS needs higher reliability than the web store if the web store is down, customers can't browse, but if the POS is down during an event, cashiers can't sell at all.

Future architecture: separate POS as a standalone PWA that operates independently from the main website.`,
    category: 'Web App',
    tags: ['Next.js', 'Three.js', 'R3F', 'E-Commerce', 'POS'],
    date: '2026-06-28',
    readTime: 6,
    featured: true,
  },
  {
    id: '5',
    slug: 'frontend-workflow-2026',
    title: 'My Frontend Workflow in 2026',
    excerpt: 'A look at the tools, practices, and mental models I use daily as a frontend engineer.',
    content: `## The Stack

My default stack hasn't changed dramatically Next.js, TypeScript, Tailwind CSS, Prisma. But how I use them has evolved.

## Component Architecture

I moved away from "everything is a folder" pattern. Now I keep components flat with a naming convention that makes the hierarchy obvious:

- \`user-form.tsx\` a form component
- \`user-list.tsx\` a list component
- \`user-card.tsx\` a card component inside the list

If a component has sub-components, I co-locate them in the same file until they grow enough to justify extraction. Premature modularization creates more files to jump between without actual benefit.

## State Management

Zustand for global state, React Query (TanStack Query) for server state. The distinction matters: Zustand holds UI preferences (sidebar open, theme, filters), React Query handles all data from the server.

I stopped using Context for state. It causes unnecessary re-renders and makes components harder to test. Context is for dependency injection (theme provider, locale provider), not for data.

## CSS Strategy

Tailwind CSS with a custom design token system. Every color, spacing, and typography value is defined once and reused. No ad-hoc hex values in components.

The config is split into theme tokens (colors, fonts, spacing) and component defaults. This makes it easy to reskin a project without touching component files.

## Performance Mindset

I stopped optimizing prematurely. Ship working code first, measure with Lighthouse, then optimize the actual bottlenecks. 90% of the time the bottleneck is images or unoptimized fonts, not React re-renders.

This doesn't mean write careless code it means don't add memorization, virtualization, or code splitting before the feature works.

## What I'm Exploring

Motion library for animations (its API is cleaner than Framer Motion for most cases), and I'm experimenting with View Transitions API for page transitions instead of JavaScript-based solutions.

Also learning more about Rust through Tauri for a desktop companion app idea.`,
    category: 'Workflow',
    tags: ['Next.js', 'Workflow', 'Architecture', 'Tailwind CSS'],
    date: '2026-06-20',
    readTime: 5,
    featured: false,
  },
  {
    id: '6',
    slug: 'pixel-games-playground',
    title: 'Building a Pixel Games Playground in Next.js',
    excerpt: 'How I built 6 retro-style pixel games using HTML Canvas and React, and what I learned about game loops.',
    content: `## The Idea

The Playground section of my portfolio needed something more interactive than static project cards. I wanted mini-games that visitors could play instantly no installs, no loading screens, just click and play.

## Stack Choices

All games use HTML Canvas with React. No game engine. The canvas rendering gives full control over the pixel-art aesthetic, and keeping it in React means the games integrate seamlessly with the portfolio's navigation and theme.

### Live.current Pattern

Games run in requestAnimationFrame loops. When the modal closes, the loop must stop. But with React strict mode and re-renders, tracking animation frame state became tricky.

The solution: a \`live.current\` ref checked at the start of every \`draw()\` call. If the component unmounts, \`live.current\` flips to false, and the loop exits cleanly. No memory leaks, no rAF errors.

## The Games

Snake: pixel head with eyes and tongue, gradient-tapering body, food with glow effect and particle burst on eat.

Asteroids: ship with red nose cone, filled rocks with crater detail, 40-star field at varied alpha for parallax feel.

Flappy Bird: pixel bird with wing animation and eye, pipe caps with shading detail.

Tetris: ghost piece showing where the block will land, block shading for depth, line clear and score HUD.

Mario: a full platformer with a Mario sprite rendered on a 5×7 pixel grid, three levels, coin collection, goomba stomping, and collision detection.

Pong: green player paddle vs red AI, 20-frame ball trail, center dashed line.

## Rendering

The pixel art is drawn programmatically using \`fillRect\` calls no sprite sheets or image assets. Each game has a render function that draws the scene based on game state. This keeps the bundle size tiny and the load time instant.

The canvas style is locked to \`imageRendering: pixelated\` for that crisp retro look, with dark background \`#0f0f14\` and monospace fonts for HUD elements.

## What I Learned

Game development in React is different from regular React development. The mental model shifts from declarative (this state renders this UI) to imperative (every frame, clear canvas and redraw everything based on state).

Not using a game engine was intentional it forces understanding of the game loop, delta time, collision detection, and state management at a fundamental level. Next time I'd probably still do the same for small games like this.`,
    category: 'Next.js',
    tags: ['Canvas', 'Games', 'React', 'Pixel Art'],
    date: '2026-06-15',
    readTime: 5,
    featured: true,
  },
]

export interface FeaturedExperiment {
  title: string
  desc: string
  type: string
  icon: string
  gradient: string
}

export const featuredExperiments: FeaturedExperiment[] = [
  { title: 'RASGA Coffee Studio', desc: 'QR table-ordering system for coffee shops', type: 'web', icon: 'coffee', gradient: 'from-cyan-500/30 via-teal-500/20 to-emerald-500/30' },
  { title: 'EGAX Studios', desc: 'Fashion e-commerce with 3D hero + POS', type: 'e-commerce', icon: 'shopping-bag', gradient: 'from-violet-500/30 via-purple-500/20 to-fuchsia-500/30' },
  { title: 'InvoiceGUA', desc: 'Local-first invoicing PWA for freelancers', type: 'pwa', icon: 'receipt', gradient: 'from-amber-500/30 via-orange-500/20 to-rose-500/30' },
  { title: 'EgaLog', desc: 'Full HRIS with selfie attendance & auto payroll', type: 'web', icon: 'building-2', gradient: 'from-blue-500/30 via-indigo-500/20 to-purple-500/30' },
]

export interface FAQItem {
  question: string
  answer: string
  category: string
}

export const faqs: FAQItem[] = [
  { question: 'What tech stack do you use?', answer: 'Next.js, TypeScript, Tailwind CSS, Framer Motion, Prisma + SQLite. All pages are statically rendered with dynamic client components where needed.', category: 'technical' },
  { question: 'Can I use your code for my own portfolio?', answer: 'Absolutely. This is open source. Fork it, modify it, make it yours. A credit back is appreciated but not required.', category: 'general' },
  { question: 'Do you take freelance projects?', answer: 'Yes, I\'m open to freelance opportunities. Drop a message through the contact form or email me directly at helloegaxdev@gmail.com.', category: 'general' },
  { question: 'How long did it take to build this?', answer: 'This lab is an ongoing project. The initial build took about 2 weeks, but it keeps evolving as I experiment with new ideas and technologies.', category: 'technical' },
  { question: 'Do you offer mentorship?', answer: 'I\'m happy to help junior developers who reach out with specific questions. I don\'t do structured mentorship sessions, but I try to reply to thoughtful DMs on LinkedIn or Instagram.', category: 'general' },
]
