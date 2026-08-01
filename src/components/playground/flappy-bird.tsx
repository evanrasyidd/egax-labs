'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'

const W = 420, H = 360, GW = 60, PW = 10, PH = 50

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number) {
  const ang = Math.min(Math.max(-0.4, (t - 1.5) * 0.2), 0.5)
  ctx.save(); ctx.translate(x + r, y); ctx.rotate(ang)

  ctx.fillStyle = '#fbbf24'; ctx.fillRect(0, -r * 0.6, r * 0.7, r * 1.2)
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(r * 0.3, -r * 0.6, r * 0.4, r * 1.2)

  ctx.fillStyle = '#fff'; ctx.fillRect(r * 0.7, -r * 0.3, r * 0.3, r * 0.25)
  ctx.fillStyle = '#0f0f14'; ctx.fillRect(r * 0.85, -r * 0.25, 2, 2)

  ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(r * 0.95, 0); ctx.lineTo(r * 1.3, 0); ctx.lineTo(r * 0.95, r * 0.12); ctx.closePath(); ctx.fill()

  const wingY = Math.sin(Date.now() * 0.015 + t * 3) * 2
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(r * 0.1, -r * 0.8 + wingY, r * 0.5, r * 0.25)

  ctx.restore()
}

export function FlappyBird() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState(0)
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)

  const g = React.useRef({
    b: { x: 60, y: H / 2, vy: 0, t: 0 },
    pipes: [] as { x: number; gapY: number; scored: boolean }[],
    sc: 0,
  })

  const restart = () => {
    stRef.current = 'playing'; setSt('playing')
    const gg = g.current
    gg.b = { x: 60, y: H / 2, vy: 0, t: 0 }
    gg.pipes = []; gg.sc = 0; setScore(0)
  }

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = W; c.height = H

    const hk = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (stRef.current === 'idle' || stRef.current === 'over') { restart(); return }
        g.current.b.vy = -5.5; g.current.b.t = 0
      }
    }
    const mc = (e: PointerEvent) => {
      e.preventDefault()
      if (stRef.current === 'idle' || stRef.current === 'over') { restart(); return }
      g.current.b.vy = -5.5; g.current.b.t = 0
    }
    window.addEventListener('keydown', hk); c.addEventListener('pointerdown', mc)

    function pipeY() { return 50 + Math.random() * (H - 140) }

    const interval = setInterval(() => {
      if (stRef.current !== 'playing') return
      const gg = g.current
      gg.b.vy += 0.32; gg.b.y += gg.b.vy; gg.b.t++

      if (gg.b.y < 0 || gg.b.y + 10 > H) { stRef.current = 'over'; setSt('over'); setScore(gg.sc); return }

      if (gg.pipes.length === 0 || gg.pipes[gg.pipes.length - 1].x < W - 180) gg.pipes.push({ x: W, gapY: pipeY(), scored: false })

      for (let i = gg.pipes.length - 1; i >= 0; i--) {
        const p = gg.pipes[i]; p.x -= 2.5
        if (p.x < -GW) { gg.pipes.splice(i, 1); continue }

        if (!p.scored && p.x + GW < gg.b.x) { p.scored = true; gg.sc++; setScore(gg.sc) }

        if (gg.b.x + 10 > p.x && gg.b.x < p.x + GW) {
          if (gg.b.y < p.gapY || gg.b.y + 10 > p.gapY + 100) { stRef.current = 'over'; setSt('over'); setScore(gg.sc) }
        }
      }
    }, 18)

    function draw() {
      if (!live.current) return
      const gg = g.current
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, W, H)
      for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) if ((x + y) / 32 % 2 === 0) { ctx.fillStyle = '#15151e'; ctx.fillRect(x, y, 32, 32) }

      for (const p of gg.pipes) {
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(p.x, 0, GW, p.gapY)
        ctx.fillRect(p.x, p.gapY + 100, GW, H - p.gapY - 100)
        ctx.fillStyle = '#16a34a'
        ctx.fillRect(p.x - 3, p.gapY - 10, GW + 6, 14)
        ctx.fillRect(p.x - 3, p.gapY + 96, GW + 6, 14)
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(p.x + 2, 0, 4, p.gapY)
        ctx.fillRect(p.x + 2, p.gapY + 100, 4, H - p.gapY - 100)
      }

      drawBird(ctx, gg.b.x, gg.b.y, 10, gg.b.t)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${gg.sc}`, 6, 12)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('SPACE / TAP TO FLAP', W / 2, H / 2 - 6); ctx.fillText('DODGE THE PIPES', W / 2, H / 2 + 8)
      }
      if (stRef.current === 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
        ctx.fillText('CRASHED', W / 2, H / 2 - 16)
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${gg.sc}`, W / 2, H / 2 + 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText('TAP TO RETRY', W / 2, H / 2 + 18)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; window.removeEventListener('keydown', hk); c.removeEventListener('pointerdown', mc); clearInterval(interval) }
  }, [])

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ SPACE / TAP: FLAP ] — navigate through pipes</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground">SCORE: <span className="text-amber-400 font-semibold">{score}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', touchAction: 'none' }} />
      </div>
    </div>
  )
}
