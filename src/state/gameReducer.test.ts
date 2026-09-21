import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../data/levels'
import { ALIEN_SIZE, SHIP_Y } from '../hooks/useGameLoop'
import { createInitialState, gameReducer } from './gameReducer'

describe('gameReducer', () => {
  it('starts a fresh game in the playing status with a full shield', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' })
    expect(state.status).toBe('playing')
    expect(state.shieldHp).toBe(100)
    expect(state.levelIndex).toBe(0)
  })

  it('spawns an alien using an allowed key for the current level', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const playing = gameReducer(createInitialState(), { type: 'START_GAME' })
    const next = gameReducer(playing, { type: 'SPAWN' })

    expect(next.aliens).toHaveLength(1)
    expect(LEVELS[0].allowedKeys).toContain(next.aliens[0].char)
    randomSpy.mockRestore()
  })

  it('does not spawn aliens beyond the simultaneous cap', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    for (let i = 0; i < 10; i += 1) {
      state = gameReducer(state, { type: 'SPAWN' })
    }
    expect(state.aliens.length).toBeLessThanOrEqual(6)
  })

  it('moves aliens downward on each TICK', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SPAWN' })
    const startY = state.aliens[0].y

    state = gameReducer(state, { type: 'TICK', dt: 0.5, now: performance.now() })

    expect(state.aliens[0].y).toBeGreaterThan(startY)
  })

  it('removes an alien and deducts shield HP once it reaches the bottom', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = {
      ...state,
      aliens: [{ id: 'a1', char: 'f', x: 100, y: SHIP_Y - ALIEN_SIZE }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 1, now: performance.now() })

    expect(state.aliens).toHaveLength(0)
    expect(state.shieldHp).toBe(80)
  })

  it('ends the game when shield HP reaches zero', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = {
      ...state,
      shieldHp: 20,
      aliens: [{ id: 'a1', char: 'f', x: 100, y: SHIP_Y - ALIEN_SIZE }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 1, now: performance.now() })

    expect(state.shieldHp).toBe(0)
    expect(state.status).toBe('gameOver')
    expect(state.victory).toBe(false)
  })

  it('destroys the lowest matching alien on a correct keypress', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = {
      ...state,
      aliens: [
        { id: 'a1', char: 'f', x: 10, y: 50 },
        { id: 'a2', char: 'f', x: 20, y: 150 }, // closer to the ship
      ],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.aliens).toHaveLength(1)
    expect(state.aliens[0].id).toBe('a1')
    expect(state.score).toBe(10)
    expect(state.kills).toBe(1)
    expect(state.correctKeystrokes).toBe(1)
    expect(state.totalKeystrokes).toBe(1)
    expect(state.shipX).toBe(20)
    expect(state.lasers).toHaveLength(1)
    expect(state.lasers[0].x).toBe(state.shipX)
    expect(state.lasers[0].fromY).toBe(SHIP_Y)
  })

  it('registers a misfire without affecting shield HP when no alien matches', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, aliens: [{ id: 'a1', char: 'f', x: 10, y: 50 }] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'j' })

    expect(state.aliens).toHaveLength(1)
    expect(state.shieldHp).toBe(100)
    expect(state.totalKeystrokes).toBe(1)
    expect(state.correctKeystrokes).toBe(0)
  })

  it('triggers levelUp after reaching the level kill target', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = {
      ...state,
      kills: LEVELS[0].targetKills - 1,
      aliens: [{ id: 'a1', char: 'f', x: 10, y: 50 }],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.status).toBe('levelUp')
  })

  it('advances to the next level and resets the per-level kill counter', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, status: 'levelUp', levelIndex: 0, kills: LEVELS[0].targetKills }

    state = gameReducer(state, { type: 'ADVANCE_LEVEL' })

    expect(state.status).toBe('playing')
    expect(state.levelIndex).toBe(1)
    expect(state.kills).toBe(0)
  })

  it('declares victory after clearing the final level', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    const lastIndex = LEVELS.length - 1
    const key = LEVELS[lastIndex].allowedKeys[0]
    state = {
      ...state,
      levelIndex: lastIndex,
      kills: LEVELS[lastIndex].targetKills - 1,
      aliens: [{ id: 'a1', char: key, x: 10, y: 50 }],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key })

    expect(state.status).toBe('gameOver')
    expect(state.victory).toBe(true)
  })
})
