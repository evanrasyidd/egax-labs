import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#fafafa',
          fontFamily: 'Geist, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Flask icon */}
          <svg width="56" height="56" viewBox="0 0 512 512" style={{ marginRight: 16 }}>
            <g fill="none" stroke="#fafafa" stroke-linecap="round" stroke-linejoin="round" stroke-width="20">
              <path d="M176 416h160l32-192H144l32 192z" />
              <line x1="208" y1="224" x2="208" y2="288" />
              <line x1="256" y1="224" x2="256" y2="320" />
              <line x1="304" y1="224" x2="304" y2="288" />
              <path d="M144 224h224" />
            </g>
          </svg>
          <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Evan Lab
          </span>
        </div>
        <span style={{ fontSize: 22, color: '#a3a3a3', marginBottom: 8 }}>
          Creative Coding Playground
        </span>
        <span style={{ fontSize: 16, color: '#737373' }}>
          Evan Rasyid Ega Pratama
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
