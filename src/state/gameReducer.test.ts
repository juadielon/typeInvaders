import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../data/levels'
import { ALIEN_SIZE, PLAYFIELD_WIDTH, SHIP_Y } from '../hooks/useGameLoop'
import { ALIEN_VARIANTS, MOTHERSHIP_VARIANTS, type Alien, type Mothership } from '../types/game'
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
    variant: 'saucer',
    x: 100,
    direction: 1,
    ...overrides,
  }
}

describe('gameReducer', () => {
  it('starts a fresh game at the first level briefing with a full shield', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' })
    expect(state.status).toBe('levelBriefing')
    expect(state.shieldHp).toBe(100)
    expect(state.levelIndex).toBe(0)
  })

  function beginGame() {
    const briefing = gameReducer(createInitialState(), { type: 'START_GAME' })
    return gameReducer(briefing, { type: 'BEGIN_LEVEL' })
  }

  it('spawns an alien using an allowed key for the current level', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const playing = beginGame()
    const next = gameReducer(playing, { type: 'SPAWN' })

    expect(next.aliens).toHaveLength(1)
    expect(LEVELS[0].allowedKeys).toContain(next.aliens[0].char)
    expect(ALIEN_VARIANTS).toContain(next.aliens[0].variant)
    randomSpy.mockRestore()
  })

  it('does not spawn aliens beyond the simultaneous cap', () => {
    let state = beginGame()
    for (let i = 0; i < 10; i += 1) {
      state = gameReducer(state, { type: 'SPAWN' })
    }
    expect(state.aliens.length).toBeLessThanOrEqual(6)
  })

  it('moves aliens downward on each TICK', () => {
    let state = beginGame()
    state = gameReducer(state, { type: 'SPAWN' })
    const startY = state.aliens[0].y

    state = gameReducer(state, { type: 'TICK', dt: 0.5, now: performance.now() })

    expect(state.aliens[0].y).toBeGreaterThan(startY)
  })

  it('removes an alien and deducts shield HP once it reaches the bottom', () => {
    let state = beginGame()
    state = {
      ...state,
      aliens: [testAlien({ x: 100, y: SHIP_Y - ALIEN_SIZE })],
    }

    state = gameReducer(state, { type: 'TICK', dt: 1, now: performance.now() })

    expect(state.aliens).toHaveLength(0)
    expect(state.shieldHp).toBe(90)
  })

  it('ends the game when shield HP reaches zero', () => {
    let state = beginGame()
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
    let state = beginGame()
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
    let state = beginGame()
    state = { ...state, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'j' })

    expect(state.aliens).toHaveLength(1)
    expect(state.shieldHp).toBe(100)
    expect(state.totalKeystrokes).toBe(1)
    expect(state.correctKeystrokes).toBe(0)
  })

  it('opens the next level briefing after reaching the kill target and clears remaining aliens', () => {
    let state = beginGame()
    state = {
      ...state,
      kills: LEVELS[0].targetKills - 1,
      aliens: [testAlien(), testAlien({ id: 'a2', char: 'x', x: 200, y: 20 })],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(1)
    expect(state.kills).toBe(0)
    expect(state.aliens).toHaveLength(0)
  })

  it('stops spawning aliens once enough are already in play to clear the level', () => {
    let state = beginGame()
    state = { ...state, kills: LEVELS[0].targetKills - 1, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'SPAWN' })

    expect(state.aliens).toHaveLength(1)
  })

  it('begins play only when the learner continues from the briefing', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })

    expect(state.status).toBe('playing')
  })

  it('declares victory after clearing the final level', () => {
    let state = beginGame()
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
    let state = beginGame()
    state = { ...state, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })
    expect(state.explosions).toHaveLength(1)

    state = gameReducer(state, { type: 'TICK', dt: 0.5, now: performance.now() + 1000 })
    expect(state.explosions).toHaveLength(0)
  })

  it('does not spawn a mothership while the shield is full', () => {
    let state = beginGame()
    state = { ...state, shieldHp: 100, mothershipNextCheckAt: 0 }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })

    expect(state.mothership).toBeNull()
  })

  it('spawns a mothership once the shield has taken any damage and a check is due', () => {
    let state = beginGame()
    state = { ...state, shieldHp: 99, mothershipNextCheckAt: 0 }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })

    expect(state.mothership).not.toBeNull()
    expect(LEVELS[0].allowedKeys).toContain(state.mothership?.char)
    expect(MOTHERSHIP_VARIANTS).toContain(state.mothership?.variant)
  })

  it('moves the mothership across the playfield and removes it once it exits', () => {
    let state = beginGame()
    state = { ...state, mothership: testMothership({ x: PLAYFIELD_WIDTH - 10, direction: 1 }) }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1 })
    expect(state.mothership?.x).toBeGreaterThan(PLAYFIELD_WIDTH - 10)

    state = gameReducer(state, { type: 'TICK', dt: 5, now: 2 })
    expect(state.mothership).toBeNull()
  })

  it('restores shield HP and awards a bonus when the mothership is hit', () => {
    let state = beginGame()
    state = { ...state, shieldHp: 40, mothership: testMothership({ char: 'f' }) }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.mothership).toBeNull()
    expect(state.shieldHp).toBe(70)
    expect(state.score).toBe(50)
    expect(state.kills).toBe(0)
    expect(state.explosions).toHaveLength(1)
  })

  it('caps the shield restore from the mothership at full health', () => {
    let state = beginGame()
    state = { ...state, shieldHp: 90, mothership: testMothership({ char: 'f' }) }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.shieldHp).toBe(100)
  })
})
