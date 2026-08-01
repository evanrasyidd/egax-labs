'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'

const SZ = 18, PX = 18
const DIRS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
}

export function Snake() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState(0)
  const [hs, setHs] = React.useState(0)
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)

  const g = React.useRef({
    segs: [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }],
    dir: { x: 1, y: 0 }, next: { x: 1, y: 0 },
    food: { x: 12, y: 8 }, sc: 0,
    pts: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
  })

  function spawn(arr: { x: number; y: number }[]) {
    const s = new Set(arr.map(p => `${p.x},${p.y}`))
    let x: number, y: number
    do { x = Math.random() * SZ | 0; y = Math.random() * SZ | 0 } while (s.has(`${x},${y}`))
    return { x, y }
  }

  const restart = () => {
    const gg = g.current
    gg.segs = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }]
    gg.dir = { x: 1, y: 0 }; gg.next = { x: 1, y: 0 }
    gg.sc = 0; gg.pts = []; gg.food = spawn(gg.segs)
    setScore(0); stRef.current = 'playing'; setSt('playing')
  }

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = SZ * PX; c.height = SZ * PX

    const hk = (e: KeyboardEvent) => {
      const d = DIRS[e.key]
      if (!d) return; e.preventDefault()
      if (stRef.current === 'over' || stRef.current === 'idle') { restart(); return }
      if (d.x !== -g.current.dir.x || d.y !== -g.current.dir.y) g.current.next = d
    }
    window.addEventListener('keydown', hk)

    let sx = 0, sy = 0, touching = false
    const ts = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      sx = t.clientX; sy = t.clientY; touching = true
    }
    const tm = (e: TouchEvent) => {
      if (!touching) return
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - sx, dy = t.clientY - sy
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return
      const d = Math.abs(dx) > Math.abs(dy)
        ? { x: Math.sign(dx), y: 0 }
        : { x: 0, y: Math.sign(dy) }
      if (stRef.current === 'over' || stRef.current === 'idle') { restart(); return }
      if (d.x !== -g.current.dir.x || d.y !== -g.current.dir.y) g.current.next = d
      sx = t.clientX; sy = t.clientY
    }
    const te = () => { touching = false }
    c.addEventListener('touchstart', ts, { passive: false })
    c.addEventListener('touchmove', tm, { passive: false })
    c.addEventListener('touchend', te)

    const interval = setInterval(() => {
      if (stRef.current !== 'playing') return
      const gg = g.current; gg.dir = { ...gg.next }
      const hd = { x: gg.segs[0].x + gg.dir.x, y: gg.segs[0].y + gg.dir.y }

      if (hd.x < 0 || hd.x >= SZ || hd.y < 0 || hd.y >= SZ || gg.segs.some(p => p.x === hd.x && p.y === hd.y)) {
        setHs(h => Math.max(h, gg.sc)); setScore(gg.sc); stRef.current = 'over'; setSt('over')
        return
      }
      const ate = hd.x === gg.food.x && hd.y === gg.food.y
      gg.segs.unshift(hd)
      if (!ate) gg.segs.pop()
      if (ate) {
        gg.sc++; setScore(gg.sc)
        for (let i = 0; i < 14; i++) {
          const a = Math.PI * 2 * i / 14
          gg.pts.push({ x: gg.food.x * PX + PX / 2, y: gg.food.y * PX + PX / 2, vx: Math.cos(a) * 3.5, vy: Math.sin(a) * 3.5 - 1.5, life: 20 })
        }
        gg.food = spawn(gg.segs)
      }
    }, 105)

    function draw() {
      if (!live.current) return
      const gg = g.current
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, SZ * PX, SZ * PX)
      for (let x = 0; x < SZ; x++) for (let y = 0; y < SZ; y++) {
        if ((x + y) % 2 === 0) { ctx.fillStyle = '#15151e'; ctx.fillRect(x * PX, y * PX, PX, PX) }
      }

      const f = gg.food; const pl = Math.sin(Date.now() * 0.006) * 0.25 + 0.75
      ctx.fillStyle = `rgba(244,63,94,${pl * 0.3})`; ctx.fillRect(f.x * PX, f.y * PX, PX, PX)
      ctx.fillStyle = `rgba(244,63,94,${pl})`; ctx.fillRect(f.x * PX + 2, f.y * PX + 2, PX - 4, PX - 4)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(f.x * PX + 5, f.y * PX + 4, 3, 2)

      for (let i = gg.segs.length - 1; i >= 0; i--) {
        const s = gg.segs[i]; const t = i / Math.max(gg.segs.length - 1, 1)
        const base = i === 0 ? '#34d399' : `hsl(${150 - t * 40},70%,${45 + t * 15}%)`

        if (i === 0) {
          const dx = gg.dir.x * PX * 0.15, dy = gg.dir.y * PX * 0.15
          ctx.fillStyle = base; ctx.fillRect(s.x * PX + 1 + dx, s.y * PX + 1 + dy, PX - 2, PX - 2)
          ctx.fillStyle = '#0f0f14'; ctx.fillRect(s.x * PX + 4 + dx, s.y * PX + 4 + dy, 2, 2)
          ctx.fillRect(s.x * PX + 12 + dx, s.y * PX + 4 + dy, 2, 2)

          if (gg.dir.x === 1) { ctx.fillStyle = '#f43f5e'; ctx.fillRect(s.x * PX + 16, s.y * PX + 8, 2, 2) }
          else if (gg.dir.x === -1) { ctx.fillStyle = '#f43f5e'; ctx.fillRect(s.x * PX, s.y * PX + 8, 2, 2) }
          else if (gg.dir.y === -1) { ctx.fillStyle = '#f43f5e'; ctx.fillRect(s.x * PX + 8, s.y * PX, 2, 2) }
          else { ctx.fillStyle = '#f43f5e'; ctx.fillRect(s.x * PX + 8, s.y * PX + 16, 2, 2) }
        } else {
          const sSize = Math.max(2, PX - 2 - i * 0.15)
          const off = (PX - sSize) / 2
          ctx.fillStyle = base; ctx.fillRect(s.x * PX + off, s.y * PX + off, sSize, sSize)
        }
      }

      for (const p of gg.pts) { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life-- }
      gg.pts = gg.pts.filter(p => p.life > 0)
      for (const p of gg.pts) { ctx.globalAlpha = p.life / 20; ctx.fillStyle = '#fbbf24'; ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3) }
      ctx.globalAlpha = 1

      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${gg.sc}`, 4, 11)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('SWIPE OR PRESS ARROWS', SZ * PX / 2, SZ * PX / 2 - 6); ctx.fillText('TO START', SZ * PX / 2, SZ * PX / 2 + 8)
      }
      if (stRef.current === 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', SZ * PX / 2, SZ * PX / 2 - 16)
        ctx.fillStyle = '#34d399'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${gg.sc}`, SZ * PX / 2, SZ * PX / 2 + 4)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText(`BEST: ${Math.max(hs, gg.sc)}`, SZ * PX / 2, SZ * PX / 2 + 20)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; window.removeEventListener('keydown', hk); clearInterval(interval); c.removeEventListener('touchstart', ts); c.removeEventListener('touchmove', tm); c.removeEventListener('touchend', te) }
  }, [])

  const W = SZ * PX
  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ SWIPE / ARROW KEYS ] — eat, grow, survive</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground">SCORE: <span className="text-emerald-400 font-semibold">{score}</span></span>
        <span className="font-mono text-muted-foreground">BEST: <span className="text-foreground/60">{hs}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', touchAction: 'none' }} />
      </div>
    </div>
  )
}
