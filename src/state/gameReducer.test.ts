import { describe, expect, it, vi } from 'vitest'
import { LEVELS, variantsForLevel } from '../data/levels'
import { ALIEN_SIZE, PLAYFIELD_WIDTH, PLASMA_BLOCK_WINDOW, PLASMA_BOLT_DAMAGE, SHIP_Y } from '../hooks/useGameLoop'
import {
  ALIEN_VARIANTS,
  MOTHERSHIP_VARIANTS,
  type Alien,
  type GameState,
  type Mothership,
} from '../types/game'
import { createInitialState, gameReducer, LEVEL_CLEAR_DELAY_MS } from './gameReducer'

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
  it('starts a fresh game at lesson selection with a full shield', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' })
    expect(state.status).toBe('lessonSelect')
    expect(state.shieldHp).toBe(100)
    expect(state.levelIndex).toBe(0)
  })

  function beginGame() {
    const selection = gameReducer(createInitialState(), { type: 'START_GAME' })
    const briefing = gameReducer(selection, { type: 'SELECT_LEVEL', levelIndex: 0 })
    return gameReducer(briefing, { type: 'BEGIN_LEVEL' })
  }

  it('selects a lesson and opens its briefing', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 2 })

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(2)
  })

  it('resets gameplay progress when selecting a lesson to replay', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = { ...state, score: 120, shieldHp: 40, kills: 8 }
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 1 })

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(1)
    expect(state.score).toBe(0)
    expect(state.shieldHp).toBe(100)
    expect(state.kills).toBe(0)
    expect(state.levelStartedAt).toBe(0)
  })

  it('ignores invalid lesson selections', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' })

    expect(gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 99 })).toEqual(state)
  })

  it('spawns an alien using an allowed key for the current level', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const playing = beginGame()
    const next = gameReducer(playing, { type: 'SPAWN' })

    expect(next.aliens).toHaveLength(1)
    expect(LEVELS[0].allowedKeys).toContain(next.aliens[0].char)
    expect(ALIEN_VARIANTS).toContain(next.aliens[0].variant)
    randomSpy.mockRestore()
  })

  it('spawns Word Formation missions as left-to-right character formations', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 3 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })
    state = gameReducer(state, { type: 'SPAWN' })

    expect(state.currentWord).toBe('a')
    expect(state.aliens.map((alien) => alien.char).join('')).toBe('a')
    expect(state.aliens.every((alien) => alien.y === state.aliens[0].y)).toBe(true)
    expect(state.aliens[0].variant).not.toBe(LEVELS[3].newAlien)
    randomSpy.mockRestore()
  })

  it('targets only the leftmost character in a Word Formation', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 3 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })
    state = {
      ...state,
      currentWord: 'dad',
      aliens: [
        testAlien({ id: 'first', char: 'd', x: 100 }),
        testAlien({ id: 'second', char: 'a', x: 152 }),
      ],
    }

    const misfire = gameReducer(state, { type: 'KEY_PRESS', key: 'a' })
    expect(misfire.aliens).toHaveLength(2)
    expect(misfire.lastKeyPress?.correct).toBe(false)

    const hit = gameReducer(state, { type: 'KEY_PRESS', key: 'd' })
    expect(hit.aliens.map((alien) => alien.id)).toEqual(['second'])
    expect(hit.lastKeyPress?.correct).toBe(true)
  })

  it('completes a Word Formation when its final word is destroyed', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 3 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })
    state = {
      ...state,
      currentWord: 'dad',
      wordsCompleted: (LEVELS[3].wordTarget ?? 1) - 1,
      aliens: [
        testAlien({ id: 'first', char: 'd', x: 100 }),
        testAlien({ id: 'second', char: 'a', x: 152 }),
        testAlien({ id: 'third', char: 'd', x: 204 }),
      ],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'd' })
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'a' })
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'd' })

    expect(state.status).toBe('levelComplete')
    expect(state.wordsCompleted).toBe(LEVELS[3].wordTarget)
    expect(state.aliens).toHaveLength(0)
  })

  it('only spawns alien species unlocked by the current level', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 0 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })

    for (let i = 0; i < 5; i += 1) {
      state = gameReducer(state, { type: 'SPAWN' })
    }

    expect(state.aliens.length).toBeGreaterThan(0)
    state.aliens.forEach((alien) => {
      expect(variantsForLevel(0)).toContain(alien.variant)
    })
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
    expect(state.lastKeyPress).toEqual({ id: expect.any(String), key: 'f', correct: true })
  })

  it('destroys the closest alien without any Shield penalty', () => {
    let state = beginGame()
    state = {
      ...state,
      aliens: [
        testAlien({ id: 'a1', char: 'f', x: 10, y: 50 }),
        testAlien({ id: 'a2', char: 'j', x: 20, y: 150 }), // closer to the ship
      ],
      shieldHp: 90,
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'j' })

    expect(state.aliens).toHaveLength(1)
    expect(state.shieldHp).toBe(90)
    expect(state.targetWarning).toBeNull()
  })

  it('penalises Shield HP for destroying an alien that is not the closest to the ship', () => {
    let state = beginGame()
    state = {
      ...state,
      aliens: [
        testAlien({ id: 'a1', char: 'f', x: 10, y: 50 }),
        testAlien({ id: 'a2', char: 'j', x: 20, y: 150 }), // closer to the ship
      ],
      shieldHp: 90,
    }

    // Typing 'f' destroys the alien further from the ship while 'j' is closer.
    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.aliens).toHaveLength(1)
    expect(state.aliens[0].id).toBe('a2')
    expect(state.shieldHp).toBe(85)
    expect(state.targetWarning).toBe('outOfOrder')
    // Score and kills still count; this is a priority penalty, not a misfire.
    expect(state.score).toBe(10)
    expect(state.kills).toBe(1)
    expect(state.correctKeystrokes).toBe(1)
  })

  it('ends the game if the priority penalty drains the final Shield HP', () => {
    let state = beginGame()
    state = {
      ...state,
      aliens: [
        testAlien({ id: 'a1', char: 'f', x: 10, y: 50 }),
        testAlien({ id: 'a2', char: 'j', x: 20, y: 150 }),
      ],
      shieldHp: 5,
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.shieldHp).toBe(0)
    expect(state.status).toBe('gameOver')
    expect(state.lastKeyPress).toEqual({ id: expect.any(String), key: 'f', correct: true })
  })

  it('registers a misfire without affecting shield HP when no alien matches', () => {
    let state = beginGame()
    state = { ...state, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'j' })

    expect(state.aliens).toHaveLength(1)
    expect(state.shieldHp).toBe(100)
    expect(state.totalKeystrokes).toBe(1)
    expect(state.correctKeystrokes).toBe(0)
    expect(state.lastKeyPress).toEqual({ id: expect.any(String), key: 'j', correct: false })
  })

  it('opens mission results after reaching the kill target and clears remaining aliens', () => {
    let state = beginGame()
    state = {
      ...state,
      kills: LEVELS[0].targetKills - 1,
      aliens: [testAlien(), testAlien({ id: 'a2', char: 'x', x: 200, y: 20 })],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    // The level is held briefly so the final shot is visible.
    expect(state.status).toBe('levelComplete')
    expect(state.levelIndex).toBe(0)
    expect(state.kills).toBe(LEVELS[0].targetKills)
    expect(state.aliens).toHaveLength(0)
    expect(state.lasers).toHaveLength(1)
    // The alien that completed the level must still trigger its explosion sound.
    expect(state.audioEvent).toEqual({
      id: expect.any(String),
      type: 'alienHit',
      variant: 'scout',
    })
    expect(state.explosions).toHaveLength(1)
    expect(state.lastKeyPress).toEqual({ id: expect.any(String), key: 'f', correct: true })

    // Pin the completion timestamp to a deterministic integer so the delay
    // boundary below is exact, rather than inherited from a fractional
    // performance.now() call inside the KEY_PRESS handler.
    state = { ...state, levelCompletedAt: 1000 }

    const beforeBoundary = gameReducer(state, {
      type: 'TICK',
      dt: 0.016,
      now: state.levelCompletedAt + LEVEL_CLEAR_DELAY_MS - 1,
    })

    // One millisecond before the delay elapses, the results screen must not appear yet.
    expect(beforeBoundary.status).toBe('levelComplete')

    state = gameReducer(state, {
      type: 'TICK',
      dt: 0.016,
      now: state.levelCompletedAt + LEVEL_CLEAR_DELAY_MS,
    })

    // Exactly at the delay boundary, the level must transition to results.
    expect(state.status).toBe('levelResults')
    expect(state.levelIndex).toBe(0)
    expect(state.kills).toBe(LEVELS[0].targetKills)
  })

  it('holds the exact LEVEL_CLEAR_DELAY_MS boundary using direct integer timestamps', () => {
    const cleared: GameState = {
      ...createInitialState(),
      status: 'levelComplete',
      levelCompletedAt: 2000,
    }

    // One millisecond before the boundary, the mission must remain on levelComplete.
    const oneMsEarly = gameReducer(cleared, {
      type: 'TICK',
      dt: 0.016,
      now: cleared.levelCompletedAt + LEVEL_CLEAR_DELAY_MS - 1,
    })
    expect(oneMsEarly.status).toBe('levelComplete')

    // Exactly at the boundary, the mission must transition to results.
    const atBoundary = gameReducer(cleared, {
      type: 'TICK',
      dt: 0.016,
      now: cleared.levelCompletedAt + LEVEL_CLEAR_DELAY_MS,
    })
    expect(atBoundary.status).toBe('levelResults')
    expect(atBoundary.levelCompletedAt).toBe(0)
  })

  it('retries a completed mission with fresh gameplay progress', () => {
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'levelResults',
        levelIndex: 2,
        score: 240,
        shieldHp: 55,
        kills: LEVELS[2].targetKills,
      },
      { type: 'RETRY_LEVEL' },
    )

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(2)
    expect(state.score).toBe(0)
    expect(state.shieldHp).toBe(100)
    expect(state.kills).toBe(0)
  })

  it('continues from mission results to the next briefing', () => {
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'levelResults',
        levelIndex: 2,
        kills: LEVELS[2].targetKills,
      },
      { type: 'CONTINUE_LEVEL' },
    )

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(3)
    expect(state.kills).toBe(0)
  })

  it('resets Word Formation progress and leftover combat transients when continuing to the next mission', () => {
    const wordFormationIndex = LEVELS.findIndex((level) => level.kind === 'wordFormation')
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'levelResults',
        levelIndex: wordFormationIndex,
        currentWord: 'dad',
        wordsCompleted: LEVELS[wordFormationIndex].wordTarget ?? 0,
        mothership: {
          id: 'mothership-1',
          char: 'f',
          variant: 'cruiser',
          direction: 1,
          x: 100,
        },
        plasmaBolts: [{ id: 'plasma-1', x: 10, y: 20, createdAt: 0, sourceVariant: 'trickster' }],
        shieldFeedback: 'missed',
        shieldFeedbackUntil: 999,
        targetWarning: 'outOfOrder',
        targetWarningUntil: 999,
      },
      { type: 'CONTINUE_LEVEL' },
    )

    expect(state.currentWord).toBeNull()
    expect(state.wordsCompleted).toBe(0)
    expect(state.mothership).toBeNull()
    expect(state.plasmaBolts).toHaveLength(0)
    expect(state.shieldFeedback).toBeNull()
    expect(state.shieldFeedbackUntil).toBe(0)
    expect(state.targetWarning).toBeNull()
    expect(state.targetWarningUntil).toBe(0)
  })

  it('retries the current mission after game over', () => {
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'gameOver',
        levelIndex: 4,
        shieldHp: 0,
        score: 180,
      },
      { type: 'RETRY_LEVEL' },
    )

    expect(state.status).toBe('levelBriefing')
    expect(state.levelIndex).toBe(4)
    expect(state.shieldHp).toBe(100)
    expect(state.score).toBe(0)
  })

  it('keeps showing the final shot before the level transition completes', () => {
    let state = beginGame()
    state = { ...state, kills: LEVELS[0].targetKills - 1, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })
    const completedAt = state.levelCompletedAt

    state = gameReducer(state, { type: 'TICK', dt: 0.016, now: completedAt + 16 })

    expect(state.status).toBe('levelComplete')
    expect(state.lasers).toHaveLength(1)
    expect(state.explosions).toHaveLength(1)
  })

  it('ignores keystrokes while a cleared level is finishing its animation', () => {
    let state = beginGame()
    state = { ...state, kills: LEVELS[0].targetKills - 1, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })
    const afterClear = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(afterClear).toEqual(state)
  })

  it('launches plasma from a dangerous alien', () => {
    let state = beginGame()
    state = {
      ...state,
      nextPlasmaCheckAt: 0,
      aliens: [testAlien({ variant: 'warden', y: 100 })],
    }

    state = gameReducer(state, { type: 'TICK', dt: 0, now: 1000 })

    expect(state.plasmaBolts).toHaveLength(1)
    expect(state.plasmaBolts[0].x).toBe(10)
    // The alarm sound is driven by this explicit event id, not by array length,
    // so it still fires even when a bolt is replaced within the same tick.
    expect(state.alarmEvent).toEqual({ id: expect.any(String) })
  })

  it('raises a fresh alarm event when a missile hits the ship and a replacement launches in the same tick', () => {
    let state = beginGame()
    state = {
      ...state,
      nextPlasmaCheckAt: 0,
      aliens: [testAlien({ variant: 'warden', y: 100 })],
      plasmaBolts: [{ id: 'p1', x: 10, y: SHIP_Y, createdAt: 0, sourceVariant: 'warden' }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 0, now: 1000 })

    // The impacting bolt is removed and a new one launches in the same tick,
    // so the bolt count is unchanged, but the alarm must still be raised.
    expect(state.plasmaBolts).toHaveLength(1)
    expect(state.plasmaBolts[0].id).not.toBe('p1')
    expect(state.alarmEvent).toEqual({ id: expect.any(String) })
  })

  it('does not launch a phantom missile/alarm when the impact already depleted shields to zero', () => {
    let state = beginGame()
    state = {
      ...state,
      shieldHp: PLASMA_BOLT_DAMAGE,
      nextPlasmaCheckAt: 0,
      aliens: [testAlien({ variant: 'warden', y: 100 })],
      plasmaBolts: [{ id: 'p1', x: 10, y: SHIP_Y, createdAt: 0, sourceVariant: 'warden' }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 0, now: 1000 })

    // Shields hit zero from this same impact, so no replacement missile or
    // alarm should be raised for a bolt the game-over return discards anyway.
    expect(state.status).toBe('gameOver')
    expect(state.plasmaBolts).toHaveLength(0)
    expect(state.alarmEvent).toBeNull()
  })

  it('fires a laser at an approaching plasma missile with Spacebar, destroying it without losing Shield HP', () => {
    let state = beginGame()
    state = {
      ...state,
      plasmaBolts: [{ id: 'p1', x: 20, y: SHIP_Y - PLASMA_BLOCK_WINDOW, createdAt: 0, sourceVariant: 'warden' }],
      shieldHp: 70,
    }

    state = gameReducer(state, { type: 'SPACE_PRESS' })

    expect(state.plasmaBolts).toHaveLength(0)
    expect(state.shieldHp).toBe(70)
    expect(state.score).toBe(5)
    expect(state.lasers).toHaveLength(1)
    expect(state.explosions).toHaveLength(1)
    expect(state.shipX).toBe(20)
    expect(state.correctKeystrokes).toBe(1)
    expect(state.totalKeystrokes).toBe(1)
  })

  it('counts an empty Spacebar press as a misfire against accuracy', () => {
    let state = beginGame()
    state = { ...state, plasmaBolts: [] }

    state = gameReducer(state, { type: 'SPACE_PRESS' })

    expect(state.plasmaBolts).toHaveLength(0)
    expect(state.correctKeystrokes).toBe(0)
    expect(state.totalKeystrokes).toBe(1)
  })

  it('homes plasma towards the spaceship as it moves', () => {
    let state = beginGame()
    state = {
      ...state,
      shipX: 300,
      plasmaBolts: [{ id: 'p1', x: 20, y: 100, createdAt: 0, sourceVariant: 'warden' }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1000 })

    expect(state.plasmaBolts[0].x).toBeGreaterThan(20)
    expect(state.plasmaBolts[0].x).toBeLessThan(300)
  })
  it('damages the Shield when a plasma bolt reaches the ship', () => {
    let state = beginGame()
    state = {
      ...state,
      plasmaBolts: [{ id: 'p1', x: 20, y: SHIP_Y - 1, createdAt: 0, sourceVariant: 'warden' }],
      shieldHp: 70,
    }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1000 })

    expect(state.plasmaBolts).toHaveLength(0)
    expect(state.shieldHp).toBe(70 - PLASMA_BOLT_DAMAGE)
    expect(state.shieldFeedback).toBe('missed')
    expect(state.explosions).toHaveLength(1)
    expect(state.explosions[0].x).toBe(state.shipX)
    expect(state.explosions[0].y).toBe(SHIP_Y)
  })

  it('ends the game when a missed plasma bolt drains the final Shield HP', () => {
    let state = beginGame()
    state = {
      ...state,
      plasmaBolts: [{ id: 'p1', x: 20, y: SHIP_Y - 1, createdAt: 0, sourceVariant: 'warden' }],
      shieldHp: PLASMA_BOLT_DAMAGE,
    }

    state = gameReducer(state, { type: 'TICK', dt: 0.1, now: 1000 })

    expect(state.status).toBe('gameOver')
    expect(state.shieldHp).toBe(0)
  })
  it('stops spawning aliens once enough are already in play to clear the level', () => {
    let state = beginGame()
    state = { ...state, kills: LEVELS[0].targetKills - 1, aliens: [testAlien()] }

    state = gameReducer(state, { type: 'SPAWN' })

    expect(state.aliens).toHaveLength(1)
  })

  it('begins play only when the learner continues from the briefing', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: 0 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })

    expect(state.status).toBe('playing')
  })

  it('declares victory after clearing the final level, holding levelComplete until the exact delay boundary', () => {
    let state = beginGame()
    const lastIndex = LEVELS.length - 1
    const key = LEVELS[lastIndex].allowedKeys[0]
    state = {
      ...state,
      levelIndex: lastIndex,
      kills: LEVELS[lastIndex].targetKills - 1,
      wordsCompleted: (LEVELS[lastIndex].wordTarget ?? 1) - 1,
      currentWord: key,
      aliens: [testAlien({ char: key })],
    }

    state = gameReducer(state, { type: 'KEY_PRESS', key })

    expect(state.status).toBe('levelComplete')
    expect(state.victory).toBe(false)

    // Pin the completion timestamp to a deterministic integer so the delay
    // boundary below is exact, rather than inherited from a fractional
    // performance.now() call inside the KEY_PRESS handler.
    state = { ...state, levelCompletedAt: 1000 }

    const beforeBoundary = gameReducer(state, {
      type: 'TICK',
      dt: 0.016,
      now: state.levelCompletedAt + LEVEL_CLEAR_DELAY_MS - 1,
    })

    // One millisecond before the delay elapses, the final mission must still be held on levelComplete.
    expect(beforeBoundary.status).toBe('levelComplete')

    state = gameReducer(state, {
      type: 'TICK',
      dt: 0.016,
      now: state.levelCompletedAt + LEVEL_CLEAR_DELAY_MS,
    })

    // Exactly at the delay boundary, the final mission must transition to results.
    expect(state.status).toBe('levelResults')
    expect(state.victory).toBe(false)

    state = gameReducer(state, { type: 'CONTINUE_LEVEL' })

    expect(state.status).toBe('gameOver')
    expect(state.victory).toBe(true)
    expect(state.levelIndex).toBe(lastIndex)
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
    expect(state.lastKeyPress).toEqual({ id: expect.any(String), key: 'f', correct: true })
  })

  it('caps the shield restore from the mothership at full health', () => {
    let state = beginGame()
    state = { ...state, shieldHp: 90, mothership: testMothership({ char: 'f' }) }

    state = gameReducer(state, { type: 'KEY_PRESS', key: 'f' })

    expect(state.shieldHp).toBe(100)
  })
})
