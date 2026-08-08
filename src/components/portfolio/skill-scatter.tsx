'use client'

import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { skills } from '@/lib/portfolio-data'
import { TechIcon } from './tech-icon'

const GAP = 8
const TILE = 72
const HEIGHT = 340

export function SkillScatter({ activeCategory }: { activeCategory: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])
  const startPosRef = useRef<{ x: number; y: number }[]>([])
  const [dropped, setDropped] = useState(false)
  const droppedRef = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !droppedRef.current) {
          droppedRef.current = true
          const containerRect = el.getBoundingClientRect()
          startPosRef.current = tileRefs.current.map(tileEl => {
            if (!tileEl) return { x: 0, y: 0 }
            const r = tileEl.getBoundingClientRect()
            return { x: r.left - containerRect.left + TILE / 2, y: r.top - containerRect.top + TILE / 2 }
          })
          setDropped(true)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!dropped) return
    const container = containerRef.current
    if (!container) return
    const width = container.clientWidth

    const engine = Matter.Engine.create()
    engine.gravity.y = 0.9
    engine.enableSleeping = false

    const WALL = 150
    const wallOpts = { isStatic: true, restitution: 0.2 }
    const floor   = Matter.Bodies.rectangle(width / 2, HEIGHT + WALL / 2 - 10, width + WALL * 2, WALL, wallOpts)
    const leftWall  = Matter.Bodies.rectangle(-WALL / 2 + 10, HEIGHT / 2, WALL, HEIGHT + WALL * 2, wallOpts)
    const rightWall = Matter.Bodies.rectangle(width + WALL / 2 - 10, HEIGHT / 2, WALL, HEIGHT + WALL * 2, wallOpts)
    Matter.World.add(engine.world, [floor, leftWall, rightWall])

    const bodies = skills.map((_, i) => {
      const start = startPosRef.current[i] ?? { x: Math.random() * width, y: 0 }
      return Matter.Bodies.rectangle(start.x, start.y, TILE, TILE, {
        chamfer: { radius: 12 },
        restitution: 0.2,
        friction: 0.5,
        frictionAir: 0.02,
      })
    })
    Matter.World.add(engine.world, bodies)

    const mouse = Matter.Mouse.create(container)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } },
    })
    Matter.World.add(engine.world, mouseConstraint)

    const forceRelease = () => {
      mouseConstraint.mouse.button = -1
      mouseConstraint.body = null as unknown as Matter.Body
    }
    window.addEventListener('mouseup', forceRelease)
    window.addEventListener('touchend', forceRelease)

    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)

    let raf: number
    let running = true
    const sync = () => {
      if (!running) return
      bodies.forEach((body, i) => {
        const el = tileRefs.current[i]
        if (!el) return
        el.style.transform = `translate(${body.position.x - TILE / 2}px, ${body.position.y - TILE / 2}px) rotate(${body.angle}rad)`
      })
      raf = requestAnimationFrame(sync)
    }
    sync()

    const visObs = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting
        if (running) sync()
      },
      { threshold: 0 }
    )
    visObs.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      visObs.disconnect()
      window.removeEventListener('mouseup', forceRelease)
      window.removeEventListener('touchend', forceRelease)
      Matter.Runner.stop(runner)
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)
    }
  }, [dropped])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-border/40 bg-card/30"
      style={{ height: HEIGHT }}
    >
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          display: dropped ? 'block' : 'flex',
          paddingTop: dropped ? 0 : 12,
        }}
      >
        {skills.map((skill, i) => (
          <div
            key={skill.name}
            ref={el => { tileRefs.current[i] = el }}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border text-center text-[10px] font-semibold leading-tight transition-opacity duration-300 ${
              activeCategory && activeCategory !== 'All' && skill.category !== activeCategory
                ? 'opacity-20'
                : 'opacity-100'
            }`}
            style={{
              position: dropped ? 'absolute' : 'relative',
              top: 0, left: 0,
              width: TILE, height: TILE,
              background: `${skill.color}1A`,
              borderColor: `${skill.color}40`,
              color: skill.color,
              cursor: dropped ? 'grab' : 'default',
              touchAction: dropped ? 'none' : 'auto',
              willChange: dropped ? 'transform' : undefined,
            }}
          >
            {skill.icon ? (
              <>
                <TechIcon icon={skill.icon} color={skill.color ?? '#000'} size={28} />
                <span className="px-1 leading-tight">{skill.name}</span>
              </>
            ) : (
              <span className="px-1 leading-tight">{skill.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
