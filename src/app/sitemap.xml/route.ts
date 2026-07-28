import { NextResponse } from 'next/server'
import { blogPosts } from '@/lib/portfolio-data'

export const dynamic = 'force-static'

export async function GET() {
  const siteUrl = 'https://evanrasyidd.vercel.app'
  const now = new Date().toISOString()

  // Main pages
  const pages = [
    { path: '/', priority: '1.0', changefreq: 'weekly', lastmod: now },
    { path: '/about', priority: '0.9', changefreq: 'monthly', lastmod: now },
    { path: '/experiments', priority: '0.9', changefreq: 'weekly', lastmod: now },
    { path: '/devlog', priority: '0.9', changefreq: 'weekly', lastmod: now },
    { path: '/playground', priority: '0.8', changefreq: 'monthly', lastmod: now },
    { path: '/dashboard', priority: '0.7', changefreq: 'daily', lastmod: now },
    { path: '/guestbook', priority: '0.7', changefreq: 'daily', lastmod: now },
    { path: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: now },
    { path: '/links', priority: '0.6', changefreq: 'monthly', lastmod: now },
  ]

  const pageUrls = pages
    .map(
      (p) => `  <url>
    <loc>${siteUrl}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n')

  // Blog post URLs (each blog post gets its own entry)
  const blogUrls = blogPosts
    .map((post) => {
      const lastmod = new Date(post.date).toISOString()
      return `  <url>
    <loc>${siteUrl}/#/blog</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls}
${blogUrls}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
