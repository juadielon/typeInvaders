import { describe, expect, it } from 'vitest'
import { LEVELS } from '../data/levels'
import { createInitialState, gameReducer } from './gameReducer'

describe('mission alien introduction', () => {
  it('opens each mission with its newly introduced alien species', () => {
    let state = gameReducer(createInitialState(), { type: 'START_GAME' })
    state = gameReducer(state, { type: 'SELECT_LEVEL', levelIndex: LEVELS.length - 1 })
    state = gameReducer(state, { type: 'BEGIN_LEVEL' })
    state = gameReducer(state, { type: 'SPAWN' })

    expect(state.aliens[0].variant).toBe(LEVELS[LEVELS.length - 1].newAlien)
  })
})
