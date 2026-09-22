import { describe, expect, it } from 'vitest'
import type { Alien } from '../types/game'
import { getAlienKeyPriority } from './alienTargets'

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
    expect(priority.activeKeys).toEqual(['j', 'f', 'd'])
  })

  it('returns no primary key when no aliens are visible', () => {
    expect(getAlienKeyPriority([])).toEqual({ activeKeys: [], primaryKey: undefined })
  })
})
