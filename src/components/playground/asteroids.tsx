'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'

const W = 420, H = 420

function mkR(x: number, y: number, r: number) {
  const n = 8 + Math.random() * 5 | 0
  return {
    x, y, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, r,
    a: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.03,
    vs: Array.from({ length: n }, (_, i) => {
      const a = Math.PI * 2 * i / n + (Math.random() - 0.5) * 0.35
      return { x: Math.cos(a) * r * (0.55 + Math.random() * 0.45), y: Math.sin(a) * r * (0.55 + Math.random() * 0.45) }
    }),
  }
}

export function Asteroids() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState(0)
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)

  const g = React.useRef({
    s: { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, r: 10 },
    rocks: [] as ReturnType<typeof mkR>[],
    buls: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    pts: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    stars: [] as { x: number; y: number; a: number }[],
    sc: 0, cd: 0,
  })
  const keys = React.useRef(new Set<string>())
  const fire = React.useRef(false)
  const joy = React.useRef({ x: 0, y: 0, act: false })

  const restart = () => {
    stRef.current = 'playing'; setSt('playing')
    const gg = g.current
    gg.s = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, r: 10 }
    gg.rocks = Array.from({ length: 5 }, () => {
      let x: number, y: number
      do { x = Math.random() * W; y = Math.random() * H } while (Math.hypot(x - W / 2, y - H / 2) < 100)
      return mkR(x, y, 22 + Math.random() * 10)
    })
    gg.buls = []; gg.pts = []; gg.sc = 0; gg.cd = 0
    setScore(0)
  }

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = W; c.height = H

    const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, a: 0.1 + Math.random() * 0.35 }))
    g.current.stars = stars

    const kd = (e: KeyboardEvent) => {
      keys.current.add(e.key)
      if (e.key === ' ') e.preventDefault()
      if (stRef.current === 'idle' || stRef.current === 'over') restart()
    }
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)

    const ts = (e: TouchEvent) => {
      e.preventDefault()
      if (stRef.current === 'idle' || stRef.current === 'over') { restart(); return }
      const t = e.touches[0]; const r = c.getBoundingClientRect()
      joy.current = { x: (t.clientX - r.left) * (W / r.width), y: (t.clientY - r.top) * (H / r.height), act: true }
    }
    const tm = (e: TouchEvent) => {
      if (!joy.current.act) return
      e.preventDefault()
      const t = e.touches[0]; const r = c.getBoundingClientRect()
      joy.current.x = (t.clientX - r.left) * (W / r.width)
      joy.current.y = (t.clientY - r.top) * (H / r.height)
    }
    const te = () => { joy.current.act = false }
    c.addEventListener('touchstart', ts, { passive: false })
    c.addEventListener('touchmove', tm, { passive: false })
    c.addEventListener('touchend', te)

    function draw() {
      if (!live.current) return
      const gg = g.current
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, W, H)

      for (const s of gg.stars) { ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fillRect(s.x, s.y, 2, 2) }

      if (stRef.current === 'playing') {
        const s = gg.s
        const rot = (keys.current.has('ArrowLeft') ? -1 : 0) + (keys.current.has('ArrowRight') ? 1 : 0)
        if (rot) s.a += rot * 0.05
        if (keys.current.has('ArrowUp')) {
          s.vx += Math.cos(s.a) * 0.12; s.vy += Math.sin(s.a) * 0.12
          if (Math.random() < 0.4) gg.pts.push({ x: s.x - Math.cos(s.a) * s.r, y: s.y - Math.sin(s.a) * s.r, vx: -Math.cos(s.a) * 2 + (Math.random() - 0.5) * 2, vy: -Math.sin(s.a) * 2 + (Math.random() - 0.5) * 2, life: 8 })
        }
        if (joy.current.act) {
          const dx = joy.current.x - s.x, dy = joy.current.y - s.y
          const dist = Math.hypot(dx, dy)
          if (dist > 4) {
            const want = Math.atan2(dy, dx)
            let diff = want - s.a
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            s.a += Math.max(-1, Math.min(1, diff)) * 0.05
          }
          if (dist > 26) {
            s.vx += Math.cos(s.a) * 0.12; s.vy += Math.sin(s.a) * 0.12
            if (Math.random() < 0.4) gg.pts.push({ x: s.x - Math.cos(s.a) * s.r, y: s.y - Math.sin(s.a) * s.r, vx: -Math.cos(s.a) * 2 + (Math.random() - 0.5) * 2, vy: -Math.sin(s.a) * 2 + (Math.random() - 0.5) * 2, life: 8 })
          }
        }
        s.vx *= 0.98; s.vy *= 0.98; s.x += s.vx; s.y += s.vy
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0; if (s.y < 0) s.y = H; if (s.y > H) s.y = 0

        if (gg.cd > 0) gg.cd--
        if ((keys.current.has(' ') || fire.current) && gg.cd === 0) {
          gg.buls.push({ x: s.x + Math.cos(s.a) * s.r, y: s.y + Math.sin(s.a) * s.r, vx: Math.cos(s.a) * 7 + s.vx * 0.5, vy: Math.sin(s.a) * 7 + s.vy * 0.5, life: 50 })
          gg.cd = 8
        }

        for (let bi = gg.buls.length - 1; bi >= 0; bi--) {
          const b = gg.buls[bi]; b.x += b.vx; b.y += b.vy; b.life--
          if (b.life <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) { gg.buls.splice(bi, 1); continue }
          for (let ri = gg.rocks.length - 1; ri >= 0; ri--) {
            const r = gg.rocks[ri]
            if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
              gg.buls.splice(bi, 1); gg.sc += Math.max(1, Math.floor(20 / r.r)); setScore(gg.sc)
              for (let pi = 0; pi < 10; pi++) {
                const pa = Math.random() * Math.PI * 2
                gg.pts.push({ x: r.x, y: r.y, vx: Math.cos(pa) * (2 + Math.random() * 4), vy: Math.sin(pa) * (2 + Math.random() * 4), life: 12 })
              }
              if (r.r > 12) { for (let k = 0; k < 2; k++) { const c2 = mkR(r.x, r.y, r.r * 0.45); c2.vx = (Math.random() - 0.5) * 3; c2.vy = (Math.random() - 0.5) * 3; gg.rocks.push(c2) } }
              gg.rocks.splice(ri, 1); break
            }
          }
        }

        for (const r of gg.rocks) {
          r.x += r.vx; r.y += r.vy; r.a += r.rs
          if (r.x < -r.r) r.x = W + r.r; if (r.x > W + r.r) r.x = -r.r
          if (r.y < -r.r) r.y = H + r.r; if (r.y > H + r.r) r.y = -r.r
          if (Math.hypot(r.x - s.x, r.y - s.y) < r.r + s.r) { stRef.current = 'over'; setSt('over') }
        }
        if (gg.rocks.length === 0) gg.rocks = Array.from({ length: 5 }, () => mkR(Math.random() * W, Math.random() * H, 22 + Math.random() * 10))
      }

      for (const r of gg.rocks) {
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.a)
        ctx.fillStyle = 'rgba(255,255,255,0.12)'
        ctx.beginPath()
        r.vs.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y))
        ctx.closePath(); ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2
        ctx.beginPath()
        r.vs.forEach((v, i) => i === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y))
        ctx.closePath(); ctx.stroke()

        const cx = r.vs.reduce((s, v) => s + v.x, 0) / r.vs.length
        const cy = r.vs.reduce((s, v) => s + v.y, 0) / r.vs.length
        ctx.fillStyle = 'rgba(255,255,255,0.07)'
        ctx.beginPath(); ctx.arc(cx - r.r * 0.25, cy - r.r * 0.25, r.r * 0.28, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(cx + r.r * 0.2, cy + r.r * 0.15, r.r * 0.18, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }

      for (const b of gg.buls) { ctx.fillStyle = '#fbbf24'; ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3) }

      const s = g.current.s
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.beginPath()
      ctx.moveTo(s.r, 0); ctx.lineTo(-s.r * 0.6, -s.r * 0.6); ctx.lineTo(-s.r * 0.3, 0); ctx.lineTo(-s.r * 0.6, s.r * 0.6)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(s.r, 0); ctx.lineTo(-s.r * 0.6, -s.r * 0.6); ctx.lineTo(-s.r * 0.3, 0); ctx.lineTo(-s.r * 0.6, s.r * 0.6)
      ctx.closePath(); ctx.stroke()

      ctx.fillStyle = '#f43f5e'
      ctx.beginPath(); ctx.moveTo(s.r * 0.8, 0); ctx.lineTo(s.r * 0.2, -2); ctx.lineTo(s.r * 0.2, 2); ctx.closePath(); ctx.fill()
      ctx.restore()

      for (const p of gg.pts) { p.x += p.vx; p.y += p.vy; p.life-- }
      gg.pts = gg.pts.filter(p => p.life > 0)
      for (const p of gg.pts) { ctx.globalAlpha = p.life / 12; ctx.fillStyle = '#f97316'; ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2) }
      ctx.globalAlpha = 1

      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${gg.sc}`, 6, 12)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('ARROWS: MOVE  SPACE: SHOOT', W / 2, H / 2 - 6)
        ctx.fillText('TOUCH: DRAG TO STEER', W / 2, H / 2 + 8)
      }
      if (stRef.current === 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
        ctx.fillText('DESTROYED', W / 2, H / 2 - 16)
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${gg.sc}`, W / 2, H / 2 + 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText('PRESS SPACE / TOUCH TO RETRY', W / 2, H / 2 + 18)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); c.removeEventListener('touchstart', ts); c.removeEventListener('touchmove', tm); c.removeEventListener('touchend', te) }
  }, [])

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ ARROWS: MOVE/ROTATE | SPACE: SHOOT ] touch: drag to steer</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground">SCORE: <span className="text-amber-400 font-semibold">{score}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', touchAction: 'none' }} />
      </div>
      <div className="hidden pointer-coarse:flex justify-end pt-1">
        <button
          onPointerDown={e => { e.preventDefault(); fire.current = true }}
          onPointerUp={() => { fire.current = false }}
          onPointerLeave={() => { fire.current = false }}
          onPointerCancel={() => { fire.current = false }}
          className="h-12 w-20 select-none rounded-lg border border-amber-400/40 bg-amber-400/10 font-mono text-xs font-semibold text-amber-300 active:bg-amber-400/25 touch-none"
        >FIRE</button>
      </div>
    </div>
  )
}
