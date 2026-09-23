import { describe, expect, it } from 'vitest'
import type { Alien } from '../types/game'
import { getAlienKeyPriority, getKeyboardHighlights } from './alienTargets'

function alien(id: string, char: string, y: number): Alien {
  return { id, char, y, x: 100, variant: 'scout' }
}

describe('getAlienKeyPriority', () => {
  it('makes the closest alien character primary and keeps other visible keys secondary', () => {
    const priority = getAlienKeyPriority([
      alien('a1', 'f', 80),
      alien('a2', 'j', 220),
      alien('a3', 'd', 140),
      alien('a4', 'f', 40),
    ])

    expect(priority.primaryKey).toBe('j')
    expect(priority.primaryTargetId).toBe('a2')
    expect(priority.activeKeys).toEqual(['j', 'f', 'd'])
  })

  describe('getKeyboardHighlights', () => {
    it('highlights every lesson key without a primary key during the briefing', () => {
      expect(getKeyboardHighlights('levelBriefing', ['f', 'j', 'd', 'k'], [])).toEqual({
        activeKeys: ['f', 'j', 'd', 'k'],
        primaryKey: undefined,
        primaryTargetId: undefined,
      })
    })

    it('returns to closest-alien priority during gameplay', () => {
      expect(
        getKeyboardHighlights(
          'playing',
          ['f', 'j', 'd', 'k'],
          [alien('a1', 'f', 80), alien('a2', 'j', 220)],
        ),
      ).toEqual({ activeKeys: ['j', 'f'], primaryKey: 'j', primaryTargetId: 'a2' })
    })
  })

  it('returns no primary key when no aliens are visible', () => {
    expect(getAlienKeyPriority([])).toEqual({
      activeKeys: [],
      primaryKey: undefined,
      primaryTargetId: undefined,
    })
  })

  it('uses the leftmost remaining alien as the Word Formation target', () => {
    const priority = getAlienKeyPriority(
      [
        { ...alien('a1', 'd', 100), x: 180 },
        { ...alien('a2', 'a', 100), x: 80 },
      ],
      true,
    )

    expect(priority.primaryKey).toBe('a')
    expect(priority.primaryTargetId).toBe('a2')
    expect(priority.activeKeys).toEqual(['a', 'd'])
  })
})
