'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

const W = 420, H = 300, G = 266

const MARIO_SPRITE = [
  [0,1,1,1,0],
  [1,1,1,1,1],
  [2,2,0,2,2],
  [2,1,1,1,2],
  [1,1,1,1,1],
  [4,4,4,4,4],
  [4,0,4,0,4],
]
const PS = 5
const PW = MARIO_SPRITE[0].length * PS
const PH = MARIO_SPRITE.length * PS

const GOOMBA = [
  [0,3,3,3,0],
  [3,3,3,3,3],
  [3,0,0,0,3],
  [0,3,3,3,0],
]
const GS = 5
const GW = GOOMBA[0].length * GS
const GH = GOOMBA.length * GS

function drawSprite(ctx: CanvasRenderingContext2D, sprite: number[][], x: number, y: number, s: number, colors: Record<number, string>, flip = false) {
  for (let r = 0; r < sprite.length; r++) for (let c = 0; c < sprite[r].length; c++) {
    const v = sprite[r][c]; if (!v) continue
    const dx = flip ? (sprite[r].length - 1 - c) * s : c * s
    ctx.fillStyle = colors[v]; ctx.fillRect(x + dx, y + r * s, s, s)
  }
}

const marioColors: Record<number, string> = { 1: '#ef4444', 2: '#fbbf24', 4: '#3b82f6' }
const goombaColors: Record<number, string> = { 3: '#8B5E3C' }

export function MarioGame() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState(0)
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)

  const levels = [
    { plats: [{ x: 0, y: G, w: W }, { x: 30, y: 210, w: 70 }, { x: 140, y: 180, w: 60 }, { x: 260, y: 200, w: 70 }, { x: 160, y: 130, w: 50 }, { x: 330, y: 160, w: 60 }],
      coins: [{ x: 50, y: 190 }, { x: 155, y: 160 }, { x: 175, y: 160 }, { x: 280, y: 180 }, { x: 170, y: 108 }, { x: 350, y: 140 }],
      enemies: [{ x: 180, y: G, w: GW, h: GH, vx: -1 }, { x: 300, y: G, w: GW, h: GH, vx: 1 }, { x: 155, y: 158, w: GW, h: GH, vx: -0.8 }] },
    { plats: [{ x: 0, y: G, w: W }, { x: 10, y: 210, w: 60 }, { x: 110, y: 170, w: 70 }, { x: 230, y: 200, w: 60 }, { x: 330, y: 170, w: 60 }, { x: 190, y: 120, w: 50 }],
      coins: [{ x: 30, y: 190 }, { x: 130, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 180 }, { x: 350, y: 150 }, { x: 205, y: 100 }],
      enemies: [{ x: 240, y: G, w: GW, h: GH, vx: -1.2 }, { x: 350, y: G, w: GW, h: GH, vx: -0.8 }, { x: 120, y: 148, w: GW, h: GH, vx: 0.6 }] },
    { plats: [{ x: 0, y: G, w: W }, { x: 40, y: 200, w: 60 }, { x: 150, y: 160, w: 50 }, { x: 250, y: 180, w: 60 }, { x: 340, y: 140, w: 50 }, { x: 180, y: 100, w: 50 }, { x: 70, y: 130, w: 50 }],
      coins: [{ x: 60, y: 180 }, { x: 165, y: 140 }, { x: 270, y: 160 }, { x: 355, y: 120 }, { x: 195, y: 80 }, { x: 85, y: 110 }, { x: 110, y: 110 }],
      enemies: [{ x: 170, y: G, w: GW, h: GH, vx: -1.5 }, { x: 360, y: G, w: GW, h: GH, vx: 1 }, { x: 270, y: 158, w: GW, h: GH, vx: -0.7 }] },
  ]

  const g = React.useRef({
    p: { x: 40, y: 100, vy: 0, dir: 1, t: 0, frame: 0 },
    plats: [] as { x: number; y: number; w: number }[],
    coins: [] as { x: number; y: number; got: boolean }[],
    enemies: [] as { x: number; y: number; w: number; h: number; vx: number; dead: boolean }[],
    sc: 0, level: 0,
  })

  const restart = () => {
    stRef.current = 'playing'; setSt('playing')
    const gg = g.current
    const lv = levels[gg.level % levels.length]
    gg.p = { x: 40, y: 100, vy: 0, dir: 1, t: 0, frame: 0 }
    gg.plats = lv.plats.map(p => ({ ...p }))
    gg.coins = lv.coins.map(c => ({ x: c.x, y: c.y, got: false }))
    gg.enemies = lv.enemies.map(e => ({ ...e, dead: false }))
    gg.sc = 0; setScore(0)
  }

  const keys = React.useRef(new Set<string>())

  const pressKey = (k: string) => {
    if (stRef.current === 'idle' || stRef.current === 'over') { restart(); return }
    keys.current.add(k)
    if ((k === ' ' || k === 'ArrowUp') && g.current.p.vy === 0) g.current.p.vy = -7.5
  }
  const releaseKey = (k: string) => keys.current.delete(k)

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = W; c.height = H

    const kd = (e: KeyboardEvent) => {
      keys.current.add(e.key)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      if (stRef.current === 'idle' || stRef.current === 'over') { restart(); return }
      if ((e.key === ' ' || e.key === 'ArrowUp') && g.current.p.vy === 0) g.current.p.vy = -7.5
    }
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key)
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku)

    const interval = setInterval(() => {
      if (stRef.current !== 'playing') return
      const gg = g.current; const p = gg.p

      if (keys.current.has('ArrowLeft')) { p.x -= 3; p.dir = -1 }
      if (keys.current.has('ArrowRight')) { p.x += 3; p.dir = 1 }

      p.vy += 0.45; p.y += p.vy
      p.t++
      if (p.t % 6 === 0) p.frame = (p.frame + 1) % 4

      let onGround = false
      for (const pl of gg.plats) {
        if (p.vy >= 0 && p.x + PW > pl.x && p.x < pl.x + pl.w && p.y + PH >= pl.y && p.y + PH <= pl.y + 14) {
          p.y = pl.y - PH; p.vy = 0; onGround = true
        }
      }

      if (p.y > H + 50) { stRef.current = 'over'; setSt('over'); setScore(gg.sc); return }

      for (const c of gg.coins) {
        if (!c.got && Math.abs(p.x + PW / 2 - c.x) < 18 && Math.abs(p.y + PH / 2 - c.y) < 18) {
          c.got = true; gg.sc += 50; setScore(gg.sc)
        }
      }

      for (const e of gg.enemies) {
        if (e.dead) continue
        e.x += e.vx
        if (e.x < -40 || e.x > W + 40) continue

        const stomp = p.vy > 0 && p.y + PH >= e.y && p.y + PH <= e.y + 8 && p.x + PW > e.x && p.x < e.x + e.w
        if (stomp) { e.dead = true; gg.sc += 100; setScore(gg.sc); p.vy = -5; continue }

        if (p.x + PW > e.x && p.x < e.x + e.w && p.y + PH > e.y && p.y < e.y + e.h) {
          stRef.current = 'over'; setSt('over'); setScore(gg.sc); return
        }
      }

      const allGot = gg.coins.every(c => c.got)
      if (allGot) {
        gg.level++
        const lv = levels[gg.level % levels.length]
        gg.p = { x: 40, y: 100, vy: 0, dir: 1, t: 0, frame: 0 }
        gg.plats = lv.plats.map(p => ({ ...p }))
        gg.coins = lv.coins.map(c => ({ x: c.x, y: c.y, got: false }))
        gg.enemies = lv.enemies.map(e => ({ ...e, dead: false }))
      }
    }, 18)

    function draw() {
      if (!live.current) return
      const gg = g.current; const p = gg.p
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, W, H)

      for (let x = 0; x < W; x += 32) for (let y = 0; y < H; y += 32) if ((x + y) / 32 % 2 === 0) { ctx.fillStyle = '#15151e'; ctx.fillRect(x, y, 32, 32) }

      for (const pl of gg.plats) {
        ctx.fillStyle = '#854d0e'
        ctx.fillRect(pl.x, pl.y, pl.w, 8)
        ctx.fillStyle = '#a16207'
        ctx.fillRect(pl.x, pl.y + 2, pl.w, 7)
        for (let bx = pl.x; bx < pl.x + pl.w; bx += 16) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.fillRect(bx, pl.y, 8, 4)
          ctx.fillRect(bx + 8, pl.y + 4, 8, 4)
        }
      }

      for (const e of gg.enemies) {
        if (e.dead) continue
        drawSprite(ctx, GOOMBA, e.x, e.y, GS, goombaColors)
        ctx.fillStyle = '#fff'; ctx.fillRect(e.x + 5, e.y + 4, 3, 3)
        ctx.fillRect(e.x + 12, e.y + 4, 3, 3)
      }

      for (const c of gg.coins) {
        if (c.got) continue
        const gl = Math.sin(Date.now() * 0.005 + c.x) * 3
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath(); ctx.arc(c.x, c.y + gl, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#f59e0b'
        ctx.beginPath(); ctx.arc(c.x, c.y + gl, 3, 0, Math.PI * 2); ctx.fill()
      }

      drawSprite(ctx, MARIO_SPRITE, p.x, p.y, PS, marioColors, p.dir === -1)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${gg.sc}`, 6, 14)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '8px monospace'
      ctx.fillText(`LV ${gg.level + 1}`, W - 40, 12)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('ARROWS: MOVE  SPACE/UP: JUMP', W / 2, H / 2 - 8)
        ctx.fillText('STOMP ENEMIES  COLLECT ALL COINS', W / 2, H / 2 + 8)
      }
      if (stRef.current === 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18)
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${gg.sc}`, W / 2, H / 2 + 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'; ctx.fillText('PRESS ANY KEY TO RETRY', W / 2, H / 2 + 18)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); clearInterval(interval) }
  }, [])

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ ARROWS: MOVE | SPACE/UP: JUMP ] touch: pad below</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground">SCORE: <span className="text-amber-400 font-semibold">{score}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', touchAction: 'none' }} />
      </div>
      <div className="hidden pointer-coarse:flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <button
            onPointerDown={e => { e.preventDefault(); pressKey('ArrowLeft') }}
            onPointerUp={() => releaseKey('ArrowLeft')}
            onPointerLeave={() => releaseKey('ArrowLeft')}
            onPointerCancel={() => releaseKey('ArrowLeft')}
            className="flex h-14 w-14 items-center justify-center rounded-lg border border-blue-400/40 bg-blue-400/10 text-blue-300 active:bg-blue-400/25 touch-none select-none"
          ><ChevronLeft className="h-6 w-6" /></button>
          <button
            onPointerDown={e => { e.preventDefault(); pressKey('ArrowRight') }}
            onPointerUp={() => releaseKey('ArrowRight')}
            onPointerLeave={() => releaseKey('ArrowRight')}
            onPointerCancel={() => releaseKey('ArrowRight')}
            className="flex h-14 w-14 items-center justify-center rounded-lg border border-blue-400/40 bg-blue-400/10 text-blue-300 active:bg-blue-400/25 touch-none select-none"
          ><ChevronRight className="h-6 w-6" /></button>
        </div>
        <button
          onPointerDown={e => { e.preventDefault(); pressKey('ArrowUp') }}
          onPointerUp={() => releaseKey('ArrowUp')}
          onPointerLeave={() => releaseKey('ArrowUp')}
          onPointerCancel={() => releaseKey('ArrowUp')}
          className="h-14 w-20 rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-xs font-semibold text-emerald-300 active:bg-emerald-400/25 touch-none select-none"
        >JUMP</button>
      </div>
    </div>
  )
}
