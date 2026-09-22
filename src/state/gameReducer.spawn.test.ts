import { afterEach, describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../data/levels'
import { ALIEN_SIZE, SHIP_Y } from '../hooks/useGameLoop'
import { createInitialState, gameReducer } from './gameReducer'

describe('mission alien introduction', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens each mission with its newly introduced alien species', () => {
    LEVELS.forEach((level, levelIndex) => {
      let state = gameReducer(createInitialState(), { type: 'START_GAME' })
      state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex })
      state = gameReducer(state, { type: 'BEGIN_LEVEL' })
      state = gameReducer(state, { type: 'SPAWN' })

      expect(state.aliens[0].variant).toBe(level.newAlien)
      expect(state.hasSpawnedIntroAlien).toBe(true)
    })
  })

  it('uses the accumulated roster after the introductory alien reaches the ship', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const levelIndex = LEVELS.length - 1
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })
    state = gameReducer(state, { type: 'SPAWN' })
    state = {
      ...state,
      aliens: [{ ...state.aliens[0], y: SHIP_Y - ALIEN_SIZE }],
    }

    state = gameReducer(state, { type: 'TICK', dt: 1, now: performance.now() })
    expect(state.aliens).toHaveLength(0)
    expect(state.kills).toBe(0)
    expect(state.hasSpawnedIntroAlien).toBe(true)

    state = gameReducer(state, { type: 'SPAWN' })

    expect(state.aliens[0].variant).toBe(LEVELS[0].newAlien)
    expect(state.aliens[0].variant).not.toBe(LEVELS[levelIndex].newAlien)
  })

  it('resets introductory-alien tracking when retrying a mission', () => {
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'gameOver',
        levelIndex: 4,
        hasSpawnedIntroAlien: true,
      },
      { type: 'RETRY_LEVEL' },
    )

    expect(state.hasSpawnedIntroAlien).toBe(false)
  })

  it('resets introductory-alien tracking when continuing to the next mission', () => {
    const state = gameReducer(
      {
        ...createInitialState(),
        status: 'levelResults',
        levelIndex: 4,
        hasSpawnedIntroAlien: true,
      },
      { type: 'CONTINUE_LEVEL' },
    )

    expect(state.levelIndex).toBe(5)
    expect(state.hasSpawnedIntroAlien).toBe(false)
  })
})
