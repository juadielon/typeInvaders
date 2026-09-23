import { describe, expect, it, vi } from 'vitest'
import {
  getAlienDescentSpeed,
  getSpawnInterval,
  INITIAL_ALIEN_DESCENT_SPEED,
} from '../hooks/useGameLoop'
import { ALIEN_VARIANT_LABELS, ALIEN_VARIANTS } from '../types/game'
import { selectWordFormationWord } from '../state/gameReducer'
import { LEVELS, variantsForLevel } from './levels'

describe('LEVELS pacing', () => {
  const combatLevels = LEVELS.filter((level) => level.kind !== 'wordFormation')
  const formationMissions = LEVELS.filter((level) => level.kind === 'wordFormation')

  it('gives each lesson a longer target and a warm-up-to-faster spawn ramp', () => {
    combatLevels.forEach((level) => {
      expect(level.targetKills).toBeGreaterThanOrEqual(42)
      expect(level.spawnIntervalMs).toBeGreaterThan(level.minSpawnIntervalMs)
      expect(level.spawnRampDurationMs).toBeGreaterThan(0)
    })
  })

  it('makes each lesson longer than the one before it', () => {
    combatLevels.slice(1).forEach((level, index) => {
      expect(level.targetKills).toBeGreaterThan(LEVELS[index].targetKills)
    })
  })

  it('increases the fastest pressure as lessons progress', () => {
    combatLevels.slice(1).forEach((level, index) => {
      expect(level.minSpawnIntervalMs).toBeLessThan(LEVELS[index].minSpawnIntervalMs)
    })
  })

  it('opens every level at the same gentle spawn cadence', () => {
    combatLevels.forEach((level) => {
      expect(level.spawnIntervalMs).toBe(LEVELS[0].spawnIntervalMs)
    })
  })

  it('gives each lesson a longer ramp than the one before it', () => {
    combatLevels.slice(1).forEach((level, index) => {
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
    combatLevels.forEach((level) => {
      expect(getAlienDescentSpeed(level, 0)).toBe(INITIAL_ALIEN_DESCENT_SPEED)
      expect(getAlienDescentSpeed(level, level.spawnRampDurationMs)).toBe(level.descentSpeed)
      expect(getAlienDescentSpeed(level, level.spawnRampDurationMs * 2)).toBe(level.descentSpeed)
    })

    expect(
      getAlienDescentSpeed(combatLevels[combatLevels.length - 1], combatLevels[combatLevels.length - 1].spawnRampDurationMs),
    ).toBeGreaterThan(getAlienDescentSpeed(LEVELS[0], LEVELS[0].spawnRampDurationMs))
  })

  it('interleaves five Word Formation missions at curriculum checkpoints', () => {
    expect(formationMissions).toHaveLength(5)
    expect(formationMissions.map((mission) => mission.id)).toEqual([16, 17, 18, 19, 20])
    expect(formationMissions.every((mission) => mission.wordPool && mission.wordTarget)).toBe(true)
  })

  it('keeps every Word Formation word inside its released key set', () => {
    formationMissions.forEach((mission) => {
      mission.wordPool?.forEach((word) => {
        expect([...word].every((char) => mission.allowedKeys.includes(char))).toBe(true)
      })
    })
  })

  it('includes occasional semicolon-ending formations in the first word bank', () => {
    const firstMission = formationMissions[0]
    expect(firstMission.wordPool?.some((word) => word.endsWith(';'))).toBe(true)
    expect(firstMission.wordPool?.some((word) => !word.endsWith(';'))).toBe(true)
  })

  it('gives the second mission a longer practice target and punctuation variants', () => {
    const secondMission = formationMissions[1]
    expect(secondMission.wordTarget).toBe(12)
    expect(secondMission.wordPool).toContain('glassfuls')
    expect(secondMission.wordPool).toContain('rajah')
    expect(secondMission.wordPool?.some((word) => word.endsWith(';'))).toBe(true)
    expect(secondMission.wordPool?.some((word) => word.length >= 8)).toBe(true)
  })

  it('gives the third mission a longer practice target and valid top-row words', () => {
    const thirdMission = formationMissions[2]
    expect(thirdMission.wordTarget).toBe(14)
    expect(thirdMission.wordPool).toContain('disqualified')
    expect(thirdMission.wordPool).toContain('housekeepers')
    expect(thirdMission.wordPool).toContain('praise')
    expect(thirdMission.wordPool).not.toContain('quick')
    expect(thirdMission.wordPool?.some((word) => word.endsWith(';'))).toBe(true)
    expect(thirdMission.wordPool?.some((word) => word.length >= 10)).toBe(true)
  })

  it('gives the fourth mission a longer practice target and new-reach words', () => {
    const fourthMission = formationMissions[3]
    expect(fourthMission.wordTarget).toBe(16)
    expect(fourthMission.wordPool).toContain('microprocessor')
    expect(fourthMission.wordPool).toContain('overachievers')
    expect(fourthMission.wordPool).toContain('mushroom')
    expect(fourthMission.wordPool).not.toContain('movement')
    expect(fourthMission.wordPool?.some((word) => word.endsWith(';'))).toBe(true)
    expect(fourthMission.wordPool?.some((word) => word.length >= 12)).toBe(true)
  })

  it('expands the final mission for extended practice', () => {
    const finalMission = formationMissions[4]
    expect(finalMission.wordTarget).toBe(20)
    expect(finalMission.wordPool).toContain('keyboard')
    expect(finalMission.wordPool).toContain('practice')
    expect(finalMission.wordPool?.some((word) => word.endsWith(';'))).toBe(true)
  })

  it('progresses each formation mission from shorter to longer words', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    formationMissions.forEach((mission) => {
      const firstWord = selectWordFormationWord(
        mission.wordPool ?? [],
        0,
        mission.wordTarget ?? 1,
      )
      const finalWord = selectWordFormationWord(
        mission.wordPool ?? [],
        (mission.wordTarget ?? 1) - 1,
        mission.wordTarget ?? 1,
      )

      expect(firstWord?.length).toBeLessThan(finalWord?.length ?? 0)
    })

    randomSpy.mockRestore()
  })
})

describe('alien species progression', () => {
  it('introduces a distinct new alien on every level', () => {
    const introduced = LEVELS.filter((level) => level.kind !== 'wordFormation').map(
      (level) => level.newAlien,
    )

    expect(introduced).toHaveLength(15)
    expect(ALIEN_VARIANTS).toHaveLength(introduced.length)
    expect(new Set(introduced).size).toBe(introduced.length)
    introduced.forEach((variant) => {
      expect(ALIEN_VARIANTS).toContain(variant)
      expect(ALIEN_VARIANT_LABELS[variant]).toBeTruthy()
    })
  })

  it('keeps earlier species in the pool as levels progress', () => {
    expect(variantsForLevel(0)).toEqual(['scout'])
    expect(variantsForLevel(2)).toEqual(['scout', 'brute', 'trickster'])
    expect(variantsForLevel(4)).toHaveLength(4)
  })

  it('adds the mission alien to the accumulated roster', () => {
    LEVELS.filter((level) => level.kind !== 'wordFormation').forEach((level) => {
      const index = LEVELS.indexOf(level)
      expect(variantsForLevel(index)).toContain(level.newAlien)
    })
  })

  it('clamps out-of-range level indices', () => {
    expect(variantsForLevel(-3)).toEqual(['scout'])
    expect(variantsForLevel(99)).toEqual(ALIEN_VARIANTS)
  })
})
