/**
 * Core type definitions for Type Invaders.
 */

export type GameStatus = 'idle' | 'playing' | 'levelUp' | 'gameOver'

export type HandSide = 'left' | 'right'

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'

export interface Alien {
  id: string
  /** Single lowercase character this alien must be "shot" with. */
  char: string
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
  shieldHp: number
  score: number
  kills: number
  correctKeystrokes: number
  totalKeystrokes: number
  /** True when the player cleared all levels rather than losing all HP. */
  victory: boolean
  /** Timestamp (ms) the current level/game started, used for WPM calc. */
  startedAt: number
}

export interface KeyFingerInfo {
  hand: HandSide
  finger: Finger
}
