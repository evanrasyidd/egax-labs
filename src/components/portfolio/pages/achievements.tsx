'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CornerDownRight, Orbit, Bird, Blocks, Star, ArrowLeftRight, X } from 'lucide-react'
import { PageHeader } from '../page-header'
import { Snake } from '../../playground/snake'
import { Asteroids } from '../../playground/asteroids'
import { FlappyBird } from '../../playground/flappy-bird'
import { Tetris } from '../../playground/tetris'
import { MarioGame } from '../../playground/dino-run'
import { Pong } from '../../playground/pong'
import { useTranslation } from '@/lib/i18n/context'

export function AchievementsPage() {
  const { t } = useTranslation()
  const [active, setActive] = React.useState<string | null>(null)

  const games = React.useMemo(() => [
    {
      id: 'snake',
      title: t.playground.games.snake.title,
      desc: t.playground.games.snake.desc,
      icon: CornerDownRight,
      accent: 'text-emerald-500',
      component: Snake,
    },
    {
      id: 'asteroids',
      title: t.playground.games.asteroids.title,
      desc: t.playground.games.asteroids.desc,
      icon: Orbit,
      accent: 'text-orange-500',
      component: Asteroids,
    },
    {
      id: 'flappy',
      title: t.playground.games.flappy.title,
      desc: t.playground.games.flappy.desc,
      icon: Bird,
      accent: 'text-yellow-500',
      component: FlappyBird,
    },
    {
      id: 'tetris',
      title: t.playground.games.tetris.title,
      desc: t.playground.games.tetris.desc,
      icon: Blocks,
      accent: 'text-sky-500',
      component: Tetris,
    },
    {
      id: 'mario',
      title: t.playground.games.mario.title,
      desc: t.playground.games.mario.desc,
      icon: Star,
      accent: 'text-red-500',
      component: MarioGame,
    },
    {
      id: 'pong',
      title: t.playground.games.pong.title,
      desc: t.playground.games.pong.desc,
      icon: ArrowLeftRight,
      accent: 'text-blue-500',
      component: Pong,
    },
  ], [t])

  const activeGame = games.find((g) => g.id === active)

  React.useEffect(() => {
    if (active) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [active])

  return (
    <div className="py-8 sm:py-12">
      <PageHeader
        title={t.playground.pageTitle}
        description={t.playground.pageDesc}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.04, delayChildren: 0.05 },
          },
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {games.map((game) => {
          const Icon = game.icon
          return (
            <motion.button
              key={game.id}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.95, filter: 'blur(5px)' },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 18,
                  },
                },
              }}
              onClick={() => setActive(game.id)}
              className="group relative rounded-xl border border-border/50 bg-muted/30 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border/80 hover:bg-muted/50 hover:shadow-sm"
            >
              <span className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg bg-muted/60 ${game.accent} transition-transform group-hover:scale-110`}>
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-sm font-semibold">{game.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{game.desc}</p>
            </motion.button>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm p-4 pt-8 overflow-y-auto"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-xl border border-border/60 bg-card p-5 shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">{activeGame.title}</h2>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <activeGame.component />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
