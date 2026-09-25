import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../data/levels'
import type { Action } from '../state/gameReducer'
import type { GameStatus, LevelConfig } from '../types/game'
import { useGameLoop } from './useGameLoop'

const level: LevelConfig = {
  ...LEVELS[0],
  spawnIntervalMs: 1000,
  minSpawnIntervalMs: 1000,
  spawnRampDurationMs: 1,
}

let frameCallbacks: FrameRequestCallback[] = []
let nowSpy: ReturnType<typeof vi.spyOn>

function runFrame(now: number) {
  const pending = frameCallbacks
  frameCallbacks = []
  for (const callback of pending) callback(now)
}

describe('useGameLoop spawn pacing', () => {
  beforeEach(() => {
    frameCallbacks = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frameCallbacks.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    nowSpy = vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    nowSpy.mockRestore()
  })

  it('keeps progress toward the next spawn across a pause', () => {
    const dispatch = vi.fn<(action: Action) => void>()
    const { rerender } = renderHook(
      ({ status }: { status: GameStatus }) => useGameLoop(status, level, 0, dispatch),
      { initialProps: { status: 'playing' as GameStatus } },
    )

    // 800ms of a 1000ms interval has accrued, so no alien is due yet.
    runFrame(800)
    expect(dispatch.mock.calls.filter(([action]) => action.type === 'SPAWN')).toHaveLength(0)

    nowSpy.mockReturnValue(800)
    rerender({ status: 'paused' })

    // A long pause must not reset the spawn clock.
    nowSpy.mockReturnValue(5000)
    rerender({ status: 'playing' })

    dispatch.mockClear()
    runFrame(5300)

    expect(dispatch.mock.calls.filter(([action]) => action.type === 'SPAWN')).toHaveLength(1)
  })

  it('starts a fresh spawn interval when a level begins rather than resuming', () => {
    const dispatch = vi.fn<(action: Action) => void>()
    const { rerender } = renderHook(
      ({ status }: { status: GameStatus }) => useGameLoop(status, level, 0, dispatch),
      { initialProps: { status: 'briefing' as GameStatus } },
    )

    nowSpy.mockReturnValue(9000)
    rerender({ status: 'playing' })

    dispatch.mockClear()
    runFrame(9300)

    expect(dispatch.mock.calls.filter(([action]) => action.type === 'SPAWN')).toHaveLength(0)
  })
})
