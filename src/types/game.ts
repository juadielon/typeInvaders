/**
 * Core type definitions for Type Invaders.
 */

export type GameStatus = 'idle' | 'levelBriefing' | 'playing' | 'gameOver'

export type HandSide = 'left' | 'right'

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'

export const ALIEN_VARIANTS = ['scout', 'brute', 'trickster'] as const

export type AlienVariant = (typeof ALIEN_VARIANTS)[number]

export interface Alien {
  id: string
  /** Single lowercase character this alien must be "shot" with. */
  char: string
  /** Visual alien type; gameplay rules stay tied to the character. */
  variant: AlienVariant
  /** Horizontal position in px from the left of the playfield. */
  x: number
  /** Vertical position in px from the top of the playfield. */
  y: number
}

export interface Laser {
  id: string
  /** X position (matches the alien it was fired at). */
  x: number
  /** Y position the laser travels from (alien's y at time of hit) to the ship. */
  fromY: number
  toY: number
  /** Timestamp (ms) the laser was created, used to expire the animation. */
  createdAt: number
}

export interface Explosion {
  id: string
  /** Centre position of the burst, in the same coordinate space as aliens. */
  x: number
  y: number
  /** Timestamp (ms) the explosion was created, used to expire the animation. */
  createdAt: number
}

export const MOTHERSHIP_VARIANTS = ['saucer', 'cruiser', 'orb'] as const

export type MothershipVariant = (typeof MOTHERSHIP_VARIANTS)[number]

export interface Mothership {
  id: string
  /** Single lowercase character this mothership must be "shot" with. */
  char: string
  /** Visual mothership type; only one mothership is ever on screen at a time. */
  variant: MothershipVariant
  /** Horizontal centre position in px from the left of the playfield. */
  x: number
  /** Travel direction: 1 moves left-to-right, -1 moves right-to-left. */
  direction: 1 | -1
}

export interface LevelConfig {
  id: number
  /** Human-readable label, e.g. "Level 1: F & J". */
  label: string
  /** Characters that may appear on aliens during this level. */
  allowedKeys: string[]
  /** Milliseconds between alien spawns. */
  spawnIntervalMs: number
  /** Alien descent speed in pixels per second. */
  descentSpeed: number
  /** Number of aliens that must be destroyed to clear this level. */
  targetKills: number
}

export interface GameState {
  status: GameStatus
  levelIndex: number
  aliens: Alien[]
  lasers: Laser[]
  explosions: Explosion[]
  /** Horizontal ship position in px from the left of the playfield. */
  shipX: number
  shieldHp: number
  score: number
  kills: number
  correctKeystrokes: number
  totalKeystrokes: number
  /** True when the player cleared all levels rather than losing all HP. */
  victory: boolean
  /** Timestamp (ms) the current level/game started, used for WPM calc. */
  startedAt: number
  /** The roaming mothership, or null when none is currently on screen. */
  mothership: Mothership | null
  /** Timestamp (ms) of the next roll to decide whether a mothership appears. */
  mothershipNextCheckAt: number
}

export interface KeyFingerInfo {
  hand: HandSide
  finger: Finger
}
