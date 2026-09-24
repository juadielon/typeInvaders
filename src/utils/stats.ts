import type { GameState } from '../types/game'

/**
 * Words-per-minute uses the standard five-keystroke word. The clock must stop
 * while the game is paused, otherwise the displayed speed keeps falling for as
 * long as the pause overlay is open and only corrects itself after Resume.
 */
export function calculateWpm(state: GameState, now: number): number {
  const elapsedTo = state.status === 'paused' ? state.pausedAt : now
  const elapsedMinutes = Math.max((elapsedTo - state.startedAt) / 60000, 1 / 60)
  return Math.max(Math.round(state.correctKeystrokes / 5 / elapsedMinutes), 0)
}
