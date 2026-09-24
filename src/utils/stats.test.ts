import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state/gameReducer'
import type { GameState } from '../types/game'
import { calculateWpm } from './stats'

function playingState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    status: 'playing',
    startedAt: 0,
    correctKeystrokes: 200,
    ...overrides,
  }
}

describe('calculateWpm', () => {
  it('counts five correct keystrokes as one word', () => {
    // 200 keystrokes is 40 standard words; spread over two minutes that is 20 WPM.
    expect(calculateWpm(playingState(), 120_000)).toBe(20)
  })

  it('freezes the clock at the pause timestamp', () => {
    const paused = playingState({ status: 'paused', pausedAt: 120_000 })

    const atPause = calculateWpm(paused, 120_000)
    const twoMinutesLater = calculateWpm(paused, 240_000)

    expect(twoMinutesLater).toBe(atPause)
  })

  it('keeps counting once the run resumes', () => {
    const resumed = playingState({ status: 'playing', startedAt: 120_000 })

    expect(calculateWpm(resumed, 240_000)).toBe(20)
  })

  it('never reports a negative speed', () => {
    expect(calculateWpm(playingState({ correctKeystrokes: 0 }), 60_000)).toBe(0)
  })
})
