/**
 * Core type definitions for Type Invaders.
 */

export type GameStatus =
  | 'idle'
  | 'lessonSelect'
  | 'levelBriefing'
  | 'playing'
  | 'paused'
  | 'levelComplete'
  | 'levelResults'
  | 'gameOver'

export type MissionKind = 'combat' | 'wordFormation'

export type HandSide = 'left' | 'right'

export type Finger = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'

export const ALIEN_VARIANTS = [
  'scout',
  'brute',
  'trickster',
  'lurker',
  'warden',
  'giggler',
  'noodle',
  'disco',
  'moustachio',
  'propeller',
  'jellybean',
  'cyclops',
  'crabster',
  'toaster',
  'partyKing',
] as const

export type AlienVariant = (typeof ALIEN_VARIANTS)[number]

/** Friendly names shown in level briefings when a new alien joins the fight. */
export const ALIEN_VARIANT_LABELS: Record<AlienVariant, string> = {
  scout: 'Scout',
  brute: 'Brute',
  trickster: 'Trickster',
  lurker: 'Lurker',
  warden: 'Warden',
  giggler: 'The Giggler',
  noodle: 'Noodle Doodle',
  disco: 'Disco Blob',
  moustachio: 'Moustachio',
  propeller: 'Propellerhead',
  jellybean: 'Jellybean',
  cyclops: 'Wobbly Cyclops',
  crabster: 'Crabster',
  toaster: 'Cosmic Toaster',
  partyKing: 'Party King',
}

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

export interface PlasmaBolt {
  id: string
  /** Horizontal position of the incoming bolt. */
  x: number
  /** Vertical position in the alien lane. */
  y: number
  /** Timestamp used for feedback and animation bookkeeping. */
  createdAt: number
  /** Variant of the alien that fired this bolt, used to tint the missile. */
  sourceVariant: AlienVariant
}

export type ShieldFeedback = 'missed'

export type AudioEvent =
  | { id: string; type: 'alienHit'; variant: AlienVariant }
  | { id: string; type: 'mothershipHit' }
  | { id: string; type: 'plasmaMissileImpact' }

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
  kind?: MissionKind
  /** Human-readable label, e.g. "Level 1: F & J". */
  label: string
  /** Characters that may appear on aliens during this level. */
  allowedKeys: string[]
  /** Initial milliseconds between alien spawns during the warm-up. */
  spawnIntervalMs: number
  /** Fastest spawn interval reached near the end of the level. */
  minSpawnIntervalMs: number
  /** Milliseconds spent easing from the warm-up cadence to the fastest cadence. */
  spawnRampDurationMs: number
  /** Fastest alien descent speed reached near the end of the level, in pixels per second. */
  descentSpeed: number
  /** Number of aliens that must be destroyed to clear this level. */
  targetKills: number
  /** Alien species introduced by this level. */
  newAlien: AlienVariant
  /** Keys available to the word-formation pool at this checkpoint. */
  wordPool?: string[]
  /** Number of words required to complete a word-formation mission. */
  wordTarget?: number
}

export interface GameState {
  status: GameStatus
  levelIndex: number
  aliens: Alien[]
  lasers: Laser[]
  explosions: Explosion[]
  plasmaBolts: PlasmaBolt[]
  shieldFeedback: ShieldFeedback | null
  shieldFeedbackUntil: number
  /** Horizontal ship position in px from the left of the playfield. */
  shipX: number
  shieldHp: number
  score: number
  kills: number
  /** Whether this mission has already produced its guaranteed introductory alien. */
  hasSpawnedIntroAlien: boolean
  /** The word currently shown by a word-formation mission, if any. */
  currentWord: string | null
  /** Number of complete word formations cleared in the current mission. */
  wordsCompleted: number
  correctKeystrokes: number
  totalKeystrokes: number
  /** True when the player cleared all levels rather than losing all HP. */
  victory: boolean
  /** Timestamp (ms) the current game started, used for WPM calc. */
  startedAt: number
  /** Timestamp (ms) when the current pause began, or 0 while active. */
  pausedAt: number
  /** Timestamp (ms) the current level started, used for spawn pacing. */
  levelStartedAt: number
  /**
   * Timestamp (ms) the final alien of a level was destroyed. Used to hold the
   * playfield briefly so the last shot and explosion finish playing.
   */
  levelCompletedAt: number
  /** The roaming mothership, or null when none is currently on screen. */
  mothership: Mothership | null
  /** Timestamp (ms) of the next roll to decide whether a mothership appears. */
  mothershipNextCheckAt: number
  /** Timestamp (ms) when the next plasma bolt may be emitted. */
  nextPlasmaCheckAt: number
  /** Feedback shown when the player destroys an alien that wasn't the closest one to the ship. */
  targetWarning: 'outOfOrder' | null
  targetWarningUntil: number
  /** Latest gameplay event that should produce an optional sound effect. */
  audioEvent: AudioEvent | null
  /** Identifies each newly launched plasma missile so the alarm sound can be triggered exactly once per launch, even when a bolt is replaced within the same tick it hits the ship. */
  alarmEvent: { id: string } | null
  /** The most recent physical keystroke, used to momentarily flash the pressed key on the visual keyboard. */
  lastKeyPress: { id: string; key: string; correct: boolean } | null
}

export interface KeyFingerInfo {
  hand: HandSide
  finger: Finger
}
