'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'

const W = 420, H = 300, PW = 8, PH = 50

export function Pong() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState({ p: 0, ai: 0 })
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)

  const g = React.useRef({
    p: { x: 20, y: H / 2 - PH / 2 }, ai: { x: W - 28, y: H / 2 - PH / 2 },
    b: { x: W / 2, y: H / 2, vx: 3, vy: 1.5, r: 4 },
    trail: [] as { x: number; y: number; life: number }[],
    sc: { p: 0, ai: 0 },
  })

  const restart = () => {
    stRef.current = 'playing'; setSt('playing')
    const gg = g.current
    gg.p.y = H / 2 - PH / 2; gg.ai.y = H / 2 - PH / 2
    gg.b = { x: W / 2, y: H / 2, vx: (Math.random() > 0.5 ? 1 : -1) * 3, vy: (Math.random() - 0.5) * 2.5, r: 4 }
    gg.trail = []; gg.sc = { p: 0, ai: 0 }; setScore({ p: 0, ai: 0 })
  }

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = W; c.height = H

    const pm = (e: PointerEvent) => {
      if (stRef.current === 'idle') { restart(); return }
      const r = c.getBoundingClientRect()
      g.current.p.y = Math.max(0, Math.min(H - PH, (e.clientY - r.top) * (H / r.height) - PH / 2))
    }
    const pd = (e: PointerEvent) => {
      if (stRef.current === 'idle') { restart(); return }
      const r = c.getBoundingClientRect()
      g.current.p.y = Math.max(0, Math.min(H - PH, (e.clientY - r.top) * (H / r.height) - PH / 2))
    }
    c.addEventListener('pointermove', pm)
    c.addEventListener('pointerdown', pd)

    const interval = setInterval(() => {
      if (stRef.current !== 'playing') return
      const gg = g.current

      const t = gg.p.y + PH / 2; const a = gg.ai.y + PH / 2
      const d = gg.b.y - a
      if (Math.abs(d) > 3) gg.ai.y += Math.sign(d) * 1.8

      gg.b.x += gg.b.vx; gg.b.y += gg.b.vy
      gg.trail.push({ x: gg.b.x, y: gg.b.y, life: 8 })
      if (gg.trail.length > 20) gg.trail = gg.trail.slice(-20)

      if (gg.b.y <= 0 || gg.b.y >= H) gg.b.vy *= -1

      if (gg.b.x <= gg.p.x + PW && gg.b.x >= gg.p.x && gg.b.y >= gg.p.y && gg.b.y <= gg.p.y + PH) {
        const hit = (gg.b.y - (gg.p.y + PH / 2)) / (PH / 2)
        gg.b.vx = Math.abs(gg.b.vx) + 0.3; gg.b.vy = hit * 3.5
        gg.b.x = gg.p.x + PW
      }
      if (gg.b.x >= gg.ai.x - gg.b.r && gg.b.y >= gg.ai.y && gg.b.y <= gg.ai.y + PH) {
        const hit = (gg.b.y - (gg.ai.y + PH / 2)) / (PH / 2)
        gg.b.vx = -(Math.abs(gg.b.vx) + 0.3); gg.b.vy = hit * 3.5
        gg.b.x = gg.ai.x - gg.b.r
      }

      if (gg.b.x < -10) { gg.sc.ai++; setScore({ ...gg.sc }); gg.b = { x: W / 2, y: H / 2, vx: -3, vy: (Math.random() - 0.5) * 2.5, r: 4 } }
      if (gg.b.x > W + 10) { gg.sc.p++; setScore({ ...gg.sc }); gg.b = { x: W / 2, y: H / 2, vx: 3, vy: (Math.random() - 0.5) * 2.5, r: 4 } }
    }, 16)

    function draw() {
      if (!live.current) return
      const gg = g.current
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, W, H)
      for (let x = 0; x < W; x += 28) for (let y = 0; y < H; y += 28) if ((x + y) / 28 % 2 === 0) { ctx.fillStyle = '#15151e'; ctx.fillRect(x, y, 28, 28) }

      for (let y = 0; y < H; y += 24) { ctx.fillStyle = `rgba(255,255,255,${y % 48 === 0 ? 0.04 : 0.02})`; ctx.fillRect(W / 2 - 1, y, 2, 12) }

      ctx.fillStyle = '#34d399'; ctx.fillRect(gg.p.x, gg.p.y, PW, PH)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(gg.p.x + 2, gg.p.y + 4, 3, PH - 8)
      ctx.fillStyle = '#f87171'; ctx.fillRect(gg.ai.x, gg.ai.y, PW, PH)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(gg.ai.x + 3, gg.ai.y + 4, 3, PH - 8)

      for (const t of gg.trail) {
        ctx.globalAlpha = t.life / 14
        ctx.fillStyle = '#fff'; ctx.fillRect(Math.floor(t.x), Math.floor(t.y), 2, 2)
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = '#fff'; ctx.fillRect(Math.floor(gg.b.x), Math.floor(gg.b.y), gg.b.r, gg.b.r)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(Math.floor(gg.b.x) + 1, Math.floor(gg.b.y) + 1, 2, 2)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`${gg.sc.p}`, W / 2 - 30, 22)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText('YOU', W / 2 - 30, 34)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 12px monospace'
      ctx.fillText(`${gg.sc.ai}`, W / 2 + 30, 22)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText('AI', W / 2 + 30, 34)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('MOVE MOUSE / DRAG TO START', W / 2, H / 2); ctx.fillText('FIRST TO 5 WINS', W / 2, H / 2 + 16)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; c.removeEventListener('pointermove', pm); c.removeEventListener('pointerdown', pd); clearInterval(interval) }
  }, [])

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ MOUSE / DRAG: MOVE PADDLE ] first to 5 wins</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground"><span className="text-emerald-400">{score.p}</span> <span className="text-red-400">{score.ai}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', cursor: 'none', touchAction: 'none' }} />
      </div>
    </div>
  )
}
