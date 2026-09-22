import type { AlienVariant, LevelConfig } from '../types/game'

/**
 * Ordered level progression. Each level unlocks more keys, drawn from the
 * Home Row first, and increases difficulty via spawn rate and descent speed.
 * Spawns open gently and ramp towards the level's fastest cadence, so the
 * pressure builds while the learner settles into the new keys.
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    label: 'Level 1: F & J',
    allowedKeys: ['f', 'j'],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 800,
    spawnRampDurationMs: 30000,
    descentSpeed: 40,
    targetKills: 42,
    newAlien: 'scout',
  },
  {
    id: 2,
    label: 'Level 2: + D & K',
    allowedKeys: ['f', 'j', 'd', 'k'],
    spawnIntervalMs: 2000,
    minSpawnIntervalMs: 720,
    spawnRampDurationMs: 34000,
    descentSpeed: 48,
    targetKills: 50,
    newAlien: 'brute',
  },
  {
    id: 3,
    label: 'Level 3: + A & ;',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';'],
    spawnIntervalMs: 1900,
    minSpawnIntervalMs: 660,
    spawnRampDurationMs: 38000,
    descentSpeed: 54,
    targetKills: 58,
    newAlien: 'trickster',
  },
  {
    id: 4,
    label: 'Level 4: + S & L',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l'],
    spawnIntervalMs: 1800,
    minSpawnIntervalMs: 600,
    spawnRampDurationMs: 42000,
    descentSpeed: 60,
    targetKills: 66,
    newAlien: 'lurker',
  },
  {
    id: 5,
    label: 'Level 5: + G & H',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h'],
    spawnIntervalMs: 1700,
    minSpawnIntervalMs: 540,
    spawnRampDurationMs: 46000,
    descentSpeed: 68,
    targetKills: 74,
    newAlien: 'warden',
  },
]

/**
 * Alien species available at a given level. New species stack on top of the
 * earlier ones so the fleet visibly grows as the learner progresses.
 */
export function variantsForLevel(levelIndex: number): AlienVariant[] {
  const clamped = Math.min(Math.max(levelIndex, 0), LEVELS.length - 1)
  return LEVELS.slice(0, clamped + 1).map((level) => level.newAlien)
}
