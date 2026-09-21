import { useEffect, useRef } from 'react'
import type { GameStatus, LevelConfig } from '../types/game'

export const PLAYFIELD_WIDTH = 760
export const PLAYFIELD_HEIGHT = 420
export const ALIEN_SIZE = 40
export const SHIP_Y = PLAYFIELD_HEIGHT - 40
export const MAX_ALIENS = 6

export type GameAction =
  | { type: 'TICK'; dt: number; now: number }
  | { type: 'SPAWN' }

/**
 * Drives the game loop with requestAnimationFrame + delta-time:
 * - Dispatches SPAWN on a per-level interval.
 * - Dispatches TICK every frame (alien descent, bottom-boundary collisions,
 *   laser expiry are all handled by the reducer using dt).
 * - Pauses automatically when the tab loses focus (visibilitychange) so
 *   players aren't punished for switching tabs; resumes cleanly on return.
 */
export function useGameLoop(
  status: GameStatus,
  level: LevelConfig,
  dispatch: (action: GameAction) => void,
) {
  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const lastSpawnRef = useRef<number>(0)
  const pausedRef = useRef(false)

  useEffect(() => {
    const handleVisibility = () => {
      pausedRef.current = document.hidden
      if (!document.hidden) {
        // Reset frame timer so we don't apply a huge dt jump on resume.
        lastFrameRef.current = null
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (status !== 'playing') {
      lastFrameRef.current = null
      return
    }

    lastSpawnRef.current = performance.now()

    const step = (now: number) => {
      if (pausedRef.current) {
        lastFrameRef.current = now
        rafRef.current = requestAnimationFrame(step)
        return
      }

      const last = lastFrameRef.current ?? now
      const dt = Math.min((now - last) / 1000, 0.1) // clamp to avoid big jumps
      lastFrameRef.current = now

      if (now - lastSpawnRef.current >= level.spawnIntervalMs) {
        lastSpawnRef.current = now
        dispatch({ type: 'SPAWN' })
      }

      dispatch({ type: 'TICK', dt, now })

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [status, level, dispatch])
}
