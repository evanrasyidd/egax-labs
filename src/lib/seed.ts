import { db } from '@/lib/db'

export async function seedPortfolioData() {
  const stats = [
    { label: 'Years of Experience', value: 2, icon: 'briefcase' },
    { label: 'Projects Shipped', value: 15, icon: 'rocket' },
    { label: 'Total Commits', value: 800, icon: 'git-commit' },
    { label: 'Open Source Repos', value: 10, icon: 'repo' },
  ]
  for (const s of stats) {
    await db.siteStats.upsert({
      where: { label: s.label },
      update: {},
      create: s,
    })
  }

  const projects = [
    {
      title: 'RASGA Coffee Studio',
      slug: 'rasga-coffee-studio',
      description: 'QR-per-table ordering system for coffee shops — live admin dashboard, POS, table reservations, event management.',
      longDesc: 'Setiap meja punya QR code sendiri yang dicetak dari admin panel. Pelanggan scan, pesan langsung dari HP — tanpa download app, tanpa bikin akun. Pesanan masuk real-time ke admin dashboard yang mencakup menu management, order management, reservasi meja, dan events calendar. Ada juga POS interface terpisah dengan PIN login untuk staf yang melayani order langsung di kasir.\n\nSecurity: PIN/password pake constant-time comparison buat nutup celah timing-attack. Payment sengaja disimulasi (bukan shortcut — keputusan terdocumented) sampai Midtrans dipasang untuk production.',
      techStack: 'Next.js,TypeScript,TailwindCSS,Framer Motion,Radix UI,React Hook Form,Zod,Recharts,Vitest',
      category: 'project',
      type: 'fullstack',
      thumbnail: '/projects/rasgaa.png',
      demoUrl: 'https://rasga-coffee-mvp.vercel.app',
      repoUrl: 'https://github.com/evanrasyidd/rasga-coffee-mvp',
      featured: true,
      sort: 1,
    },
    {
      title: 'EGAX Studios',
      slug: 'egax-studios',
      description: 'Fashion e-commerce dengan 3D hero, POS terpisah, dan admin dashboard dalam satu platform.',
      longDesc: 'Storefront lengkap: katalog produk dengan filter/sort, halaman detail produk, simulasi checkout (QRIS/e-wallet/virtual account), dan area akun customer dengan riwayat pesanan, wishlist, dan alamat tersimpan.\n\nStaff punya akses `/pos` login PIN (terpisah dari flow username/password admin) untuk menangani penjualan offline. Admin manage produk, order, dan akun staff dari dashboard sendiri.\n\nCredential: password dan PIN di-hash SHA-256+salt, gak bisa di-bypass dengan flip flag di console browser. 3D hero pake React Three Fiber + Rapier — awalnya pake drei HDRI yang suka crash WebGL, di-rebuild pake manual lighting (ambient + directional + point light) tanpa external dependencies.',
      techStack: 'Next.js,JavaScript,TailwindCSS,Framer Motion,Zustand,React Three Fiber',
      category: 'project',
      type: 'e-commerce',
      thumbnail: '/projects/egax-studiosss.png',
      demoUrl: 'https://egax-studios-mvp.vercel.app',
      repoUrl: 'https://github.com/evanrasyidd/egax-studios-mvp',
      featured: true,
      sort: 2,
    },
    {
      title: 'InvoiceGUA',
      slug: 'invoicegua',
      description: 'Local-first invoicing PWA untuk freelancer Indonesia — tanpa server, PDF export, share ke WhatsApp.',
      longDesc: 'Zero backend — Dexie (wrapper IndexedDB) adalah seluruh data layer. App works fully offline, data user tetap di device mereka sendiri.\n\nInvoice dan quotation punya auto-calculate pajak/diskon/down-payment, one-click quotation-to-invoice conversion, dan client records yang snapshot datanya ke setiap dokumen (edit client gak akan ngerubah invoice lama).\n\nPDF pake @react-pdf/renderer (text selectable, bukan screenshot), ada WhatsApp deep-link buat kirim ringkasan dokumen ke nomor klien.\n\nAuth local: SHA-256+salt via Web Crypto API, session di sessionStorage. Ada backup/restore flow buat export seluruh dataset sebagai JSON.',
      techStack: 'React,TypeScript,TailwindCSS,Zustand,Framer Motion,Vite,React Router,Dexie,Chart.js',
      category: 'project',
      type: 'pwa',
      thumbnail: '/projects/invoicegua.png',
      demoUrl: 'https://invoicegua-mvp.vercel.app',
      repoUrl: 'https://github.com/evanrasyidd/invoicegua-mvp',
      featured: true,
      sort: 3,
    },
    {
      title: 'EgaLog',
      slug: 'egalog',
      description: 'HRIS lengkap — absensi selfie+geofencing, payroll otomatis, recruitment pipeline, 5 role level.',
      longDesc: 'Lima role level (Owner sampai Staff) dengan route protection ditegakkan di server — audit matrix di repo mendokumentasikan role mana yang bisa akses page mana, diverifikasi pake curl requests.\n\nClock-in/out wajib selfie langsung dari kamera browser (gallery ditolak) plus geofencing radius kantor. Payroll auto-generate slip bulanan: transport/meal allowance dihitung dari hari hadir aktual, overtime dari delta clock-out minus clock-in, potongan tanpa-keterangan dicek silang sama approved leave.\n\nCuti pake auto multi-level approval chain. Performance review quarterly dengan draft-to-final workflow. Recruitment punya halaman `/karir` publik yang feed-nya sama dengan candidate pipeline internal. Ada juga System Admin account — terpisah total dari employee table.',
      techStack: 'Next.js,TypeScript,TailwindCSS,Zustand,Zod,react-pdf',
      category: 'project',
      type: 'fullstack',
      thumbnail: '/projects/egalog.png',
      demoUrl: 'https://egalog.vercel.app',
      repoUrl: 'https://github.com/evanrasyidd/egalog',
      featured: true,
      sort: 4,
    },
  ]
  const projectSlugs = projects.map(p => p.slug)
  for (const p of projects) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    })
  }
  await db.project.deleteMany({ where: { slug: { notIn: projectSlugs } } })

  const achievements = [
    {
      title: 'Frontend Development Certification',
      issuer: 'FreeCodeCamp',
      date: '2024-06-01',
      description: 'Completed 300-hour frontend development curriculum.',
      credentialUrl: 'https://freecodecamp.org/certification/evanrasyidd',
      category: 'certification',
      type: 'professional',
      sort: 1,
    },
    {
      title: 'Best UI Design — Hackathon 2024',
      issuer: 'Local Developer Community',
      date: '2024-08-15',
      description: 'Awarded best UI/UX design in 48-hour hackathon.',
      credentialUrl: null,
      category: 'award',
      type: 'competition',
      sort: 2,
    },
    {
      title: 'React Open Source Contributor',
      issuer: 'GitHub',
      date: '2025-03-01',
      description: 'Contributed to popular React open source libraries.',
      credentialUrl: 'https://github.com/evanrasyidd',
      category: 'award',
      type: 'professional',
      sort: 3,
    },
    {
      title: 'Top 20% — Monkeytype ID Leaderboard',
      issuer: 'Monkeytype',
      date: '2025-06-01',
      description: '120 WPM average, 95% accuracy.',
      credentialUrl: 'https://monkeytype.com/profile/evanrasyidd',
      category: 'award',
      type: 'competition',
      sort: 4,
    },
  ]
  for (const a of achievements) {
    const existing = await db.achievement.findFirst({ where: { title: a.title } })
    if (!existing) {
      await db.achievement.create({ data: a })
    }
  }


}
