import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../data/levels'
import { ALIEN_SIZE, PLAYFIELD_WIDTH, SHIP_Y } from '../hooks/useGameLoop'
import { ALIEN_VARIANTS, type Alien, type Mothership } from '../types/game'
import { createInitialState, gameReducer } from './gameReducer'

function testAlien(overrides: Partial<Alien> = {}): Alien {
  return {
    id: 'a1',
    char: 'f',
    variant: 'scout',
    x: 10,
    y: 50,
    ...overrides,
  }
}

function testMothership(overrides: Partial<Mothership> = {}): Mothership {
  return {
    id: 'm1',
    char: 'f',
    x: 100,
    direction: 1,
    ...overrides,
  }
}

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
    expect(ALIEN_VARIANTS).toContain(next.aliens[0].variant)
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
      aliens: [testAlien({ x: 100, y: SHIP_Y - ALIEN_SIZE })],
    }

    state = gameReducer(state, { type: 'TICK', dt: 1, now: performance.now() })

    expect(state.aliens).toHaveLength(0)
    expect(state.shieldHp).toBe(90)
  })

  it('ends the game when shield HP reaches zero', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = {
      ...state,
      shieldHp: 10,
      aliens: [testAlien({ x: 100, y: SHIP_Y - ALIEN_SIZE })],
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
        testAlien({ id: 'a1', x: 10, y: 50 }),
        testAlien({ id: 'a2', x: 20, y: 150 }), // closer to the ship
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
    expect(state.explosions).toHaveLength(1)
    expect(state.explosions[0].x).toBe(20)
    // The beam must stop exactly where the explosion occurs, not overshoot past it.
    expect(state.lasers[0].toY).toBe(state.explosions[0].y)
  })

  it('registers a misfire without affecting shield HP when no alien matches', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, aliens: [testAlien()] }

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
      aliens: [testAlien()],
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
      aliens: [testAlien({ char: key })],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key })

    expect(state.status).toBe('gameOver')
    expect(state.victory).toBe(true)
  })

  it('clears an explosion once its brief lifetime has elapsed', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })
    expect(state.explosions).toHaveLength(1)

    state = gameReducer(state, { type: 'TICK', dt: 0.5, now: performance.now() + 1000 })
    expect(state.explosions).toHaveLength(0)
  })

  it('does not spawn a mothership while the shield is full', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, shieldHp: 100, mothershipNextCheckAt: 0 }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })

    expect(state.mothership).toBeNull()
  })

  it('spawns a mothership once the shield has taken any damage and a check is due', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, shieldHp: 99, mothershipNextCheckAt: 0 }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })

    expect(state.mothership).not.toBeNull()
    expect(LEVELS[0].allowedKeys).toContain(state.mothership?.char)
  })

  it('moves the mothership across the playfield and removes it once it exits', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, mothership: testMothership({ x: PLAYFIELD_WIDTH - 10, direction: 1 }) }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })
    expect(state.mothership?.x).toBeGreaterThan(PLAYFIELD_WIDTH - 10)

    state = gameReducer(state, { type: 'TICK', dt: 5, now: 2 })
    expect(state.mothership).toBeNull()
  })

  it('restores shield HP and awards a bonus when the mothership is hit', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, shieldHp: 40, mothership: testMothership({ char: 'f' }) }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.mothership).toBeNull()
    expect(state.shieldHp).toBe(70)
    expect(state.score).toBe(50)
    expect(state.kills).toBe(0)
    expect(state.explosions).toHaveLength(1)
  })

  it('caps the shield restore from the mothership at full health', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, shieldHp: 90, mothership: testMothership({ char: 'f' }) }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.shieldHp).toBe(100)
  })
})
