'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'

const COLS = 10, ROWS = 18, SZ = 18, W = COLS * SZ, H = ROWS * SZ

const SHAPES = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,0],[0,1,1]],
]
const COLORS = ['#06b6d4','#facc15','#a855f7','#3b82f6','#f97316','#22c55e','#ef4444']

export function Tetris() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [score, setScore] = React.useState(0)
  const [st, setSt] = React.useState<'idle' | 'playing' | 'over'>('idle')
  const stRef = React.useRef(st)
  React.useEffect(() => { stRef.current = st })
  const live = React.useRef(true)
  const timeRef = React.useRef(0)

  const g = React.useRef({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    cur: { shape: SHAPES[0], color: COLORS[0], x: 3, y: 0, type: 0 },
    next: { shape: SHAPES[1], color: COLORS[1], type: 1 },
    sc: 0, lines: 0,
  })

  function gs(n: number) { return SHAPES[n % SHAPES.length] }
  function gc(n: number) { return COLORS[n % COLORS.length] }

  const restart = () => {
    stRef.current = 'playing'; setSt('playing'); timeRef.current = 0
    const gg = g.current
    gg.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    const t = Math.floor(Math.random() * SHAPES.length)
    const nt = Math.floor(Math.random() * SHAPES.length)
    gg.cur = { shape: gs(t), color: gc(t), x: 3, y: 0, type: t }
    gg.next = { shape: gs(nt), color: gc(nt), type: nt }
    gg.sc = 0; gg.lines = 0; setScore(0)
  }

  function coll(shape: number[][], x: number, y: number, grid: number[][]) {
    for (let r = 0; r < shape.length; r++) for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nx = x + c, ny = y + r
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true
      if (ny >= 0 && grid[ny][nx]) return true
    }
    return false
  }

  function lock(gg: typeof g.current) {
    const { cur, grid } = gg
    for (let r = 0; r < cur.shape.length; r++) for (let c = 0; c < cur.shape[r].length; c++) {
      if (!cur.shape[r][c]) continue
      const ny = cur.y + r
      if (ny >= 0) grid[ny][cur.x + c] = cur.type + 1
    }
    let cleared = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every(c => c)) { grid.splice(r, 1); grid.unshift(Array(COLS).fill(0)); cleared++; r++ }
    }
    if (cleared) { gg.sc += [0, 100, 300, 500, 800][cleared]; gg.lines += cleared; setScore(gg.sc) }
    const t = gg.next.type; gg.cur = { shape: gg.next.shape, color: gg.next.color, x: 3, y: 0, type: t }
    const nt = Math.floor(Math.random() * SHAPES.length)
    gg.next = { shape: gs(nt), color: gc(nt), type: nt }
    if (coll(gg.cur.shape, gg.cur.x, gg.cur.y, gg.grid)) { stRef.current = 'over'; setSt('over') }
  }

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    if (!ctx) return
    c.width = W; c.height = H

    const hk = (e: KeyboardEvent) => {
      const gg = g.current
      if (stRef.current !== 'playing') { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); restart() } return }
      e.preventDefault()
      if (e.key === 'ArrowLeft') { if (!coll(gg.cur.shape, gg.cur.x - 1, gg.cur.y, gg.grid)) gg.cur.x-- }
      else if (e.key === 'ArrowRight') { if (!coll(gg.cur.shape, gg.cur.x + 1, gg.cur.y, gg.grid)) gg.cur.x++ }
      else if (e.key === 'ArrowDown') { if (!coll(gg.cur.shape, gg.cur.x, gg.cur.y + 1, gg.grid)) { gg.cur.y++; timeRef.current = 0 } }
      else if (e.key === 'ArrowUp') {
        const rot = gg.cur.shape[0].map((_, i) => gg.cur.shape.map(r => r[i]).reverse())
        if (!coll(rot, gg.cur.x, gg.cur.y, gg.grid)) gg.cur.shape = rot
      }
      else if (e.key === ' ') {
        while (!coll(gg.cur.shape, gg.cur.x, gg.cur.y + 1, gg.grid)) gg.cur.y++
        lock(gg)
      }
    }
    window.addEventListener('keydown', hk)

    let tx = 0, ty = 0, touching = false, tapped = true
    const ts = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      tx = t.clientX; ty = t.clientY; touching = true; tapped = true
    }
    const tm = (e: TouchEvent) => {
      if (!touching) return
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - tx, dy = t.clientY - ty
      if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return
      tapped = false
      const gg = g.current
      if (stRef.current !== 'playing') { restart(); return }
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) { if (!coll(gg.cur.shape, gg.cur.x + 1, gg.cur.y, gg.grid)) gg.cur.x++ }
        else { if (!coll(gg.cur.shape, gg.cur.x - 1, gg.cur.y, gg.grid)) gg.cur.x-- }
      } else if (dy > 0) {
        while (!coll(gg.cur.shape, gg.cur.x, gg.cur.y + 1, gg.grid)) gg.cur.y++
        lock(gg)
      } else {
        const rot = gg.cur.shape[0].map((_, i) => gg.cur.shape.map(r => r[i]).reverse())
        if (!coll(rot, gg.cur.x, gg.cur.y, gg.grid)) gg.cur.shape = rot
      }
      tx = t.clientX; ty = t.clientY
    }
    const te = () => {
      if (!touching) return
      touching = false
      if (!tapped || stRef.current !== 'playing') return
      const gg = g.current
      const rot = gg.cur.shape[0].map((_, i) => gg.cur.shape.map(r => r[i]).reverse())
      if (!coll(rot, gg.cur.x, gg.cur.y, gg.grid)) gg.cur.shape = rot
    }
    c.addEventListener('touchstart', ts, { passive: false })
    c.addEventListener('touchmove', tm, { passive: false })
    c.addEventListener('touchend', te)

    const interval = setInterval(() => {
      if (stRef.current !== 'playing') return
      const gg = g.current
      timeRef.current++
      const speed = Math.max(4, 28 - gg.lines * 0.5)
      if (timeRef.current >= speed) {
        timeRef.current = 0
        if (!coll(gg.cur.shape, gg.cur.x, gg.cur.y + 1, gg.grid)) gg.cur.y++
        else lock(gg)
      }
    }, 45)

    function draw() {
      if (!live.current) return
      const gg = g.current
      ctx.fillStyle = '#0f0f14'; ctx.fillRect(0, 0, W, H)
      for (let x = 0; x < W; x += SZ) for (let y = 0; y < H; y += SZ) if ((x + y) / SZ % 2 === 0) { ctx.fillStyle = '#15151e'; ctx.fillRect(x, y, SZ, SZ) }

      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (!gg.grid[r][c]) continue
        ctx.fillStyle = COLORS[gg.grid[r][c] - 1]; ctx.fillRect(c * SZ, r * SZ, SZ, SZ)
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(c * SZ + 2, r * SZ + 2, SZ - 4, 3)
      }

      const cur = gg.cur
      if (stRef.current === 'playing') {
        let gy = cur.y
        while (!coll(cur.shape, cur.x, gy + 1, gg.grid)) gy++
        for (let r = 0; r < cur.shape.length; r++) for (let c = 0; c < cur.shape[r].length; c++) {
          if (!cur.shape[r][c]) continue
          ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect((cur.x + c) * SZ, (gy + r) * SZ, SZ, SZ)
          ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.strokeRect((cur.x + c) * SZ, (gy + r) * SZ, SZ, SZ)
        }
      }

      for (let r = 0; r < cur.shape.length; r++) for (let c = 0; c < cur.shape[r].length; c++) {
        if (!cur.shape[r][c]) continue
        const x = (cur.x + c) * SZ, y = (cur.y + r) * SZ
        ctx.fillStyle = cur.color; ctx.fillRect(x, y, SZ, SZ)
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 2, y + 2, SZ - 4, 4)
      }

      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`LINES: ${gg.lines}`, 6, 10)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 10px monospace'
      ctx.fillText(`SCORE: ${gg.sc}`, 6, 24)

      if (stRef.current === 'idle') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px monospace'; ctx.textAlign = 'center'
        ctx.fillText('SWIPE: MOVE/DROP', W / 2, H / 2 - 12)
        ctx.fillText('TAP: ROTATE', W / 2, H / 2 + 2); ctx.fillText('CLEAR LINES TO SCORE', W / 2, H / 2 + 16)
      }
      if (stRef.current === 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 18)
        ctx.fillStyle = '#a855f7'; ctx.font = 'bold 12px monospace'; ctx.fillText(`${gg.sc}`, W / 2, H / 2)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '9px monospace'
        ctx.fillText(`LINES: ${gg.lines}`, W / 2, H / 2 + 16); ctx.fillText('PRESS ARROW TO RETRY', W / 2, H / 2 + 30)
      }
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)

    return () => { live.current = false; window.removeEventListener('keydown', hk); clearInterval(interval); c.removeEventListener('touchstart', ts); c.removeEventListener('touchmove', tm); c.removeEventListener('touchend', te) }
  }, [])

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] text-muted-foreground tracking-wider">[ SWIPE: MOVE/DROP | TAP: ROTATE ]</p>
      <div className="flex items-center gap-4 text-xs">
        <span className="font-mono text-muted-foreground">SCORE: <span className="text-purple-400 font-semibold">{score}</span></span>
        {st !== 'playing' && <button onClick={restart} className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2 text-[10px] font-medium text-primary-foreground"><RotateCcw className="h-3 w-3" /> {st === 'over' ? 'RETRY' : 'START'}</button>}
      </div>
      <div className="inline-block rounded-xl border-2 border-border/60 bg-card/30 overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: W, maxWidth: '100%', height: 'auto', imageRendering: 'pixelated', touchAction: 'none' }} />
      </div>
    </div>
  )
}
