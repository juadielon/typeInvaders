import { useEffect, useRef } from 'react'
import type { GameStatus, LevelConfig } from '../types/game'

export const ALIEN_LANE_HEIGHT = 500
export const MOTHERSHIP_LANE_HEIGHT = 56
export const PLAYFIELD_WIDTH = 760
export const PLAYFIELD_HEIGHT = ALIEN_LANE_HEIGHT + MOTHERSHIP_LANE_HEIGHT
export const ALIEN_SIZE = 40
export const SHIP_Y = ALIEN_LANE_HEIGHT - 40
export const MAX_ALIENS = 6
export const MOTHERSHIP_WIDTH = 56
export const MOTHERSHIP_HEIGHT = 26
/** The mothership's fixed vertical position within its reserved top lane. */
export const MOTHERSHIP_Y = (MOTHERSHIP_LANE_HEIGHT - MOTHERSHIP_HEIGHT) / 2

export type GameAction =
  | { type: 'TICK'; dt: number; now: number }
  | { type: 'SPAWN' }

export function getSpawnInterval(level: LevelConfig, levelElapsedMs: number): number {
  const rampProgress = Math.min(Math.max(levelElapsedMs, 0) / level.spawnRampDurationMs, 1)
  return level.spawnIntervalMs + (level.minSpawnIntervalMs - level.spawnIntervalMs) * rampProgress
}

/**
 * Runs the game loop with requestAnimationFrame and delta-time, rather than
 * setInterval, so alien speed stays consistent no matter the screen's
 * refresh rate. It also spawns aliens on a timer and pauses everything
 * when the tab loses focus, so a player switching tabs doesn't come back
 * to a wall of aliens they didn't see coming.
 */
export function useGameLoop(
  status: GameStatus,
  level: LevelConfig,
  levelStartedAt: number,
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
    if (status !== 'playing' && status !== 'levelComplete') {
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

      const spawnInterval = getSpawnInterval(level, now - levelStartedAt)

      // A cleared level still ticks so the final shot animates out, but no new
      // aliens should arrive during that hold.
      if (status === 'playing' && now - lastSpawnRef.current >= spawnInterval) {
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
  }, [status, level, levelStartedAt, dispatch])
}
