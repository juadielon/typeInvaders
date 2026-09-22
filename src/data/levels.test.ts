import { describe, expect, it } from 'vitest'
import {
  getAlienDescentSpeed,
  getSpawnInterval,
  INITIAL_ALIEN_DESCENT_SPEED,
} from '../hooks/useGameLoop'
import { ALIEN_VARIANT_LABELS, ALIEN_VARIANTS } from '../types/game'
import { LEVELS, variantsForLevel } from './levels'

describe('LEVELS pacing', () => {
  it('gives each lesson a longer target and a warm-up-to-faster spawn ramp', () => {
    LEVELS.forEach((level) => {
      expect(level.targetKills).toBeGreaterThanOrEqual(42)
      expect(level.spawnIntervalMs).toBeGreaterThan(level.minSpawnIntervalMs)
      expect(level.spawnRampDurationMs).toBeGreaterThan(0)
    })
  })

  it('makes each lesson longer than the one before it', () => {
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.targetKills).toBeGreaterThan(LEVELS[index].targetKills)
    })
  })

  it('increases the fastest pressure as lessons progress', () => {
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.minSpawnIntervalMs).toBeLessThan(LEVELS[index].minSpawnIntervalMs)
    })
  })

  it('opens every level at the same gentle spawn cadence', () => {
    LEVELS.forEach((level) => {
      expect(level.spawnIntervalMs).toBe(LEVELS[0].spawnIntervalMs)
    })
  })

  it('gives each lesson a longer ramp than the one before it', () => {
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.spawnRampDurationMs).toBeGreaterThan(LEVELS[index].spawnRampDurationMs)
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

  it('starts alien descent equally and ramps to each level final speed', () => {
    LEVELS.forEach((level) => {
      expect(getAlienDescentSpeed(level, 0)).toBe(INITIAL_ALIEN_DESCENT_SPEED)
      expect(getAlienDescentSpeed(level, level.spawnRampDurationMs)).toBe(level.descentSpeed)
      expect(getAlienDescentSpeed(level, level.spawnRampDurationMs * 2)).toBe(level.descentSpeed)
    })

    expect(
      getAlienDescentSpeed(LEVELS[LEVELS.length - 1], LEVELS[LEVELS.length - 1].spawnRampDurationMs),
    ).toBeGreaterThan(getAlienDescentSpeed(LEVELS[0], LEVELS[0].spawnRampDurationMs))
  })
})

describe('alien species progression', () => {
  it('introduces a distinct new alien on every level', () => {
    const introduced = LEVELS.map((level) => level.newAlien)

    expect(introduced).toHaveLength(LEVELS.length)
    expect(ALIEN_VARIANTS).toHaveLength(LEVELS.length)
    expect(new Set(introduced).size).toBe(introduced.length)
    introduced.forEach((variant) => {
      expect(ALIEN_VARIANTS).toContain(variant)
      expect(ALIEN_VARIANT_LABELS[variant]).toBeTruthy()
    })
  })

  it('keeps earlier species in the pool as levels progress', () => {
    expect(variantsForLevel(0)).toEqual(['scout'])
    expect(variantsForLevel(2)).toEqual(['scout', 'brute', 'trickster'])
    expect(variantsForLevel(4)).toHaveLength(5)
  })

  it('adds the mission alien to the accumulated roster', () => {
    LEVELS.forEach((level, index) => {
      expect(variantsForLevel(index)).toHaveLength(index + 1)
      expect(variantsForLevel(index)).toContain(level.newAlien)
    })
  })

  it('clamps out-of-range level indices', () => {
    expect(variantsForLevel(-3)).toEqual(['scout'])
    expect(variantsForLevel(99)).toEqual(ALIEN_VARIANTS)
  })
})
