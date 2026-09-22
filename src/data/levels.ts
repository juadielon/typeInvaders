import type { LevelConfig } from '../types/game'

/**
 * Ordered level progression. Each level unlocks more keys, drawn from the
 * Home Row first, and increases difficulty via spawn rate and descent speed.
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    label: 'Level 1: F & J',
    allowedKeys: ['f', 'j'],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 1300,
    spawnRampDurationMs: 18000,
    descentSpeed: 40,
    targetKills: 32,
  },
  {
    id: 2,
    label: 'Level 2: + D & K',
    allowedKeys: ['f', 'j', 'd', 'k'],
    spawnIntervalMs: 2000,
    minSpawnIntervalMs: 1150,
    spawnRampDurationMs: 20000,
    descentSpeed: 48,
    targetKills: 38,
  },
  {
    id: 3,
    label: 'Level 3: + A & ;',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';'],
    spawnIntervalMs: 1900,
    minSpawnIntervalMs: 1050,
    spawnRampDurationMs: 22000,
    descentSpeed: 54,
    targetKills: 42,
  },
  {
    id: 4,
    label: 'Level 4: + S & L',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l'],
    spawnIntervalMs: 1800,
    minSpawnIntervalMs: 950,
    spawnRampDurationMs: 24000,
    descentSpeed: 60,
    targetKills: 48,
  },
  {
    id: 5,
    label: 'Level 5: + G & H',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h'],
    spawnIntervalMs: 1700,
    minSpawnIntervalMs: 850,
    spawnRampDurationMs: 26000,
    descentSpeed: 68,
    targetKills: 56,
  },
]
