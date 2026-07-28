import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { skills, persona } from '@/lib/portfolio-data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const results: SearchResult[] = []

    // Search blog posts (DB)
    try {
      const blogPosts = await db.blogPost.findMany()
      for (const post of blogPosts) {
        const tags = post.tags ? post.tags.split(',') : []
        const haystack = `${post.title} ${post.excerpt} ${tags.join(' ')} ${post.category}`.toLowerCase()
        if (haystack.includes(q)) {
          results.push({
            id: `blog-${post.id}`,
            type: 'blog',
            title: post.title,
            description: post.excerpt,
            route: 'devlog',
            meta: `${post.category} • ${post.readTime} min read`,
            score: post.title.toLowerCase().includes(q) ? 3 : 1,
          })
        }
      }
    } catch { /* ignore */ }

    // Search projects (DB)
    try {
      const projects = await db.project.findMany()
      for (const p of projects) {
        const haystack = `${p.title} ${p.description} ${p.techStack} ${p.category} ${p.type}`.toLowerCase()
        if (haystack.includes(q)) {
          results.push({
            id: `project-${p.id}`,
            type: 'project',
            title: p.title,
            description: p.description,
            route: 'experiments',
            meta: `${p.type} • ${p.techStack.split(',').slice(0, 3).join(', ')}`,
            score: p.title.toLowerCase().includes(q) ? 3 : 1,
          })
        }
      }
    } catch {
      // db not ready
    }

    // Search achievements (DB)
    try {
      const achievements = await db.achievement.findMany()
      for (const a of achievements) {
        const haystack = `${a.title} ${a.issuer} ${a.description || ''} ${a.category} ${a.type}`.toLowerCase()
        if (haystack.includes(q)) {
          results.push({
            id: `achievement-${a.id}`,
            type: 'achievement',
            title: a.title,
            description: `${a.issuer}${a.description ? ' — ' + a.description : ''}`,
            route: 'playground',
            meta: `${a.category} • ${a.date}`,
            score: a.title.toLowerCase().includes(q) ? 3 : 1,
          })
        }
      }
    } catch {
      // db not ready
    }

    // Search skills
    for (const skill of skills) {
      if (skill.name.toLowerCase().includes(q) || skill.category.toLowerCase().includes(q)) {
        results.push({
          id: `skill-${skill.name}`,
          type: 'skill',
          title: skill.name,
          description: `${skill.category} skill`,
          route: 'home',
          meta: skill.category,
          score: 2,
        })
      }
    }

    // Search persona
    const personaHaystack = `${persona.name} ${persona.role} ${persona.roleFull} ${persona.location}`.toLowerCase()
    if (personaHaystack.includes(q)) {
      results.push({
        id: 'persona',
        type: 'page',
        title: persona.name,
        description: persona.roleFull,
        route: 'about',
        meta: 'About me',
        score: 5,
      })
    }

    // Sort by score (desc)
    results.sort((a, b) => b.score - a.score)

    return NextResponse.json({
      results: results.slice(0, 20),
      total: results.length,
    })
  } catch (err) {
    console.error('Search API error:', err)
    return NextResponse.json({ results: [], total: 0 }, { status: 200 })
  }
}

interface SearchResult {
  id: string
  type: 'blog' | 'project' | 'achievement' | 'skill' | 'page'
  title: string
  description: string
  route: string
  meta: string
  score: number
}
