import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { persona } from '@/lib/portfolio-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const siteUrl = 'https://evanrasyidd.vercel.app'
  const feedUrl = `${siteUrl}/api/feed.xml`

  const blogPosts = await db.blogPost.findMany({ orderBy: { date: 'desc' } })

  const items = blogPosts
    .map((post) => {
      const url = `${siteUrl}/#/blog`
      const pubDate = new Date(post.date).toUTCString()
      const tags = post.tags ? post.tags.split(',') : []
      const escape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

      const htmlContent = post.content
        .split('\n\n')
        .map((block) => {
          if (block.startsWith('## ')) return `<h2>${escape(block.replace(/^##\s+/, ''))}</h2>`
          if (block.startsWith('### ')) return `<h3>${escape(block.replace(/^###\s+/, ''))}</h3>`
          return `<p>${escape(block)}</p>`
        })
        .join('\n')

      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(post.excerpt)}</description>
      <category>${escape(post.category)}</category>
      ${tags.map((t) => `<category>${escape(t)}</category>`).join('\n      ')}
      <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${persona.name} Blog</title>
    <link>${siteUrl}/#/blog</link>
    <description>Blog posts by ${persona.name} ${persona.role}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <author>
      <name>${persona.name}</name>
      <email>${persona.email}</email>
    </author>
${items}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
