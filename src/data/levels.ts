import type { AlienVariant, LevelConfig } from '../types/game'

/**
 * Ordered level progression. Levels 1-5 cover the Home Row, levels 6-10 add
 * the Top Row and levels 11-15 add the Bottom Row, each pair of keys chosen
 * to mirror the same finger pattern as the Home Row lessons (index, middle,
 * pinky, ring, then the inner index reach). Every level opens at the same
 * gentle spawn cadence (`spawnIntervalMs`), so a later, longer lesson never
 * feels harder to start than an earlier one. Difficulty instead grows via a
 * faster end-of-level cadence (`minSpawnIntervalMs`), a longer ramp/level
 * (`spawnRampDurationMs`/`targetKills`), and a faster final alien descent
 * speed. Alien descent also starts at the same gentle speed in every level.
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
    spawnIntervalMs: 2200,
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
    spawnIntervalMs: 2200,
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
    spawnIntervalMs: 2200,
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
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 540,
    spawnRampDurationMs: 46000,
    descentSpeed: 68,
    targetKills: 74,
    newAlien: 'warden',
  },
  {
    id: 6,
    label: 'Level 6: + R & U',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u'],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 515,
    spawnRampDurationMs: 49000,
    descentSpeed: 73,
    targetKills: 80,
  },
  {
    id: 7,
    label: 'Level 7: + E & I',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i'],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 490,
    spawnRampDurationMs: 52000,
    descentSpeed: 78,
    targetKills: 86,
  },
  {
    id: 8,
    label: 'Level 8: + Q & P',
    allowedKeys: ['f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p'],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 465,
    spawnRampDurationMs: 55000,
    descentSpeed: 83,
    targetKills: 92,
  },
  {
    id: 9,
    label: 'Level 9: + W & O',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 440,
    spawnRampDurationMs: 58000,
    descentSpeed: 88,
    targetKills: 98,
  },
  {
    id: 10,
    label: 'Level 10: + T & Y',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 415,
    spawnRampDurationMs: 61000,
    descentSpeed: 93,
    targetKills: 104,
  },
  {
    id: 11,
    label: 'Level 11: + V & M',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
      'v', 'm',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 390,
    spawnRampDurationMs: 64000,
    descentSpeed: 98,
    targetKills: 110,
  },
  {
    id: 12,
    label: 'Level 12: + C & ,',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
      'v', 'm', 'c', ',',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 365,
    spawnRampDurationMs: 67000,
    descentSpeed: 103,
    targetKills: 116,
  },
  {
    id: 13,
    label: 'Level 13: + Z & /',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
      'v', 'm', 'c', ',', 'z', '/',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 340,
    spawnRampDurationMs: 70000,
    descentSpeed: 108,
    targetKills: 122,
  },
  {
    id: 14,
    label: 'Level 14: + X & .',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
      'v', 'm', 'c', ',', 'z', '/', 'x', '.',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 315,
    spawnRampDurationMs: 73000,
    descentSpeed: 113,
    targetKills: 128,
  },
  {
    id: 15,
    label: 'Level 15: + B & N',
    allowedKeys: [
      'f', 'j', 'd', 'k', 'a', ';', 's', 'l', 'g', 'h', 'r', 'u', 'e', 'i', 'q', 'p', 'w', 'o', 't', 'y',
      'v', 'm', 'c', ',', 'z', '/', 'x', '.', 'b', 'n',
    ],
    spawnIntervalMs: 2200,
    minSpawnIntervalMs: 290,
    spawnRampDurationMs: 76000,
    descentSpeed: 118,
    targetKills: 134,
  },
]

/**
 * Alien species available at a given level. New species stack on top of the
 * earlier ones so the fleet visibly grows as the learner progresses. Once
 * every species has been introduced (Home Row levels), later levels simply
 * keep reusing the full roster, since the species is cosmetic only.
 */
export function variantsForLevel(levelIndex: number): AlienVariant[] {
  const clamped = Math.min(Math.max(levelIndex, 0), LEVELS.length - 1)
  const introduced = LEVELS.slice(0, clamped + 1)
    .map((level) => level.newAlien)
    .filter((variant): variant is AlienVariant => variant !== undefined)
  return introduced.length > 0 ? introduced : [LEVELS[0].newAlien as AlienVariant]
}
