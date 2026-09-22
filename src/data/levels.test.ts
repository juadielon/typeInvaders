import { describe, expect, it } from 'vitest'
import { getSpawnInterval } from '../hooks/useGameLoop'
import { LEVELS } from './levels'

describe('LEVELS pacing', () => {
  it('gives each lesson a longer target and a warm-up-to-faster spawn ramp', () => {
    LEVELS.forEach((level) => {
      expect(level.targetKills).toBeGreaterThanOrEqual(32)
      expect(level.spawnIntervalMs).toBeGreaterThan(level.minSpawnIntervalMs)
      expect(level.spawnRampDurationMs).toBeGreaterThan(0)
    })
  })

  it('increases the fastest pressure as lessons progress', () => {
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.minSpawnIntervalMs).toBeLessThan(LEVELS[index].minSpawnIntervalMs)
    })
  })

  it('ramps from the warm-up interval to the minimum interval', () => {
    const level = LEVELS[0]

    expect(getSpawnInterval(level, 0)).toBe(level.spawnIntervalMs)
    expect(getSpawnInterval(level, level.spawnRampDurationMs / 2)).toBe(
      (level.spawnIntervalMs + level.minSpawnIntervalMs) / 2,
    )
    expect(getSpawnInterval(level, level.spawnRampDurationMs)).toBe(level.minSpawnIntervalMs)
    expect(getSpawnInterval(level, level.spawnRampDurationMs * 2)).toBe(level.minSpawnIntervalMs)
  })
})
