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
    spawnIntervalMs: 1800,
    descentSpeed: 40,
    targetKills: 15,
  },
  {
    id: 2,
    label: 'Level 2: + D & K',
    allowedKeys: ['f', 'j', 'd', 'k'],
    spawnIntervalMs: 1600,
    descentSpeed: 48,
    targetKills: 20,
  },
  {
    id: 3,
    label: 'Level 3: + A & ;',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';'],
    spawnIntervalMs: 1500,
    descentSpeed: 54,
    targetKills: 22,
  },
  {
    id: 4,
    label: 'Level 4: + S & L',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l'],
    spawnIntervalMs: 1400,
    descentSpeed: 60,
    targetKills: 25,
  },
  {
    id: 5,
    label: 'Level 5: + G & H',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h'],
    spawnIntervalMs: 1200,
    descentSpeed: 68,
    targetKills: 30,
  },
]
