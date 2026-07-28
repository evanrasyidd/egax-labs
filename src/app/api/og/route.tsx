import { NextResponse } from 'next/server'

export async function GET() {
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <g transform="translate(600, 280)">
    <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="56" font-weight="700" fill="#fafafa" letter-spacing="-0.03">Evan Lab</text>
    <text x="0" y="56" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="24" fill="#a3a3a3">Creative Coding Playground</text>
    <text x="0" y="96" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="16" fill="#737373">Evan Rasyid Ega Pratama</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
