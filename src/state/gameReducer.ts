import { LEVELS, variantsForLevel } from '../data/levels'
import {
  MOTHERSHIP_VARIANTS,
  type Alien,
  type AlienVariant,
  type Explosion,
  type GameState,
  type Laser,
  type Mothership,
  type MothershipVariant,
} from '../types/game'
import {
  ALIEN_SIZE,
  MAX_ALIENS,
  MOTHERSHIP_LANE_HEIGHT,
  MOTHERSHIP_WIDTH,
  PLAYFIELD_WIDTH,
  SHIP_Y,
} from '../hooks/useGameLoop'

const HIT_DAMAGE = 10
const LASER_LIFETIME_MS = 250
const EXPLOSION_LIFETIME_MS = 300

// The mothership only shows up once the shield has taken any damage, and only
// now and then, so it reads as a rare rescue opportunity rather than a routine target.
const MOTHERSHIP_SHIELD_THRESHOLD = 100
const MOTHERSHIP_SHIELD_RESTORE = 30
const MOTHERSHIP_SCORE_BONUS = 50
const MOTHERSHIP_SPEED = 90
const MOTHERSHIP_MIN_CHECK_DELAY_MS = 8000
const MOTHERSHIP_MAX_CHECK_DELAY_MS = 16000
const MOTHERSHIP_RETRY_DELAY_MS = 2000
/** The mothership's centre in the alien coordinate space, so it renders inside the reserved top lane. */
const MOTHERSHIP_LASER_Y = -(MOTHERSHIP_LANE_HEIGHT / 2)

export type Action =
  | { type: 'START_GAME' }
  | { type: 'SELECT_LEVEL'; levelIndex: number }
  | { type: 'TICK'; dt: number; now: number }
  | { type: 'SPAWN' }
  | { type: 'KEY_PRESS'; key: string }
  | { type: 'BEGIN_LEVEL' }
  | { type: 'RESET' }

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function createInitialState(): GameState {
  return {
    status: 'idle',
    levelIndex: 0,
    aliens: [],
    lasers: [],
    explosions: [],
    shipX: PLAYFIELD_WIDTH / 2,
    shieldHp: 100,
    score: 0,
    kills: 0,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    victory: false,
    startedAt: 0,
    mothership: null,
    mothershipNextCheckAt: 0,
    levelStartedAt: 0,
  }
}

function randomChar(allowedKeys: string[]): string {
  return allowedKeys[Math.floor(Math.random() * allowedKeys.length)]
}

function randomVariant(levelIndex: number): AlienVariant {
  const variants = variantsForLevel(levelIndex)
  return variants[Math.floor(Math.random() * variants.length)]
}

function randomMothershipVariant(): MothershipVariant {
  return MOTHERSHIP_VARIANTS[Math.floor(Math.random() * MOTHERSHIP_VARIANTS.length)]
}

function randomX(): number {
  const margin = ALIEN_SIZE
  return margin + Math.random() * (PLAYFIELD_WIDTH - margin * 2)
}

function randomMothershipCheckDelay(): number {
  return (
    MOTHERSHIP_MIN_CHECK_DELAY_MS +
    Math.random() * (MOTHERSHIP_MAX_CHECK_DELAY_MS - MOTHERSHIP_MIN_CHECK_DELAY_MS)
  )
}

function spawnMothership(allowedKeys: string[]): Mothership {
  const direction = Math.random() < 0.5 ? 1 : -1
  return {
    id: nextId('mothership'),
    char: randomChar(allowedKeys),
    variant: randomMothershipVariant(),
    direction,
    x: direction === 1 ? -MOTHERSHIP_WIDTH / 2 : PLAYFIELD_WIDTH + MOTHERSHIP_WIDTH / 2,
  }
}

function explosionAt(x: number, y: number, now: number): Explosion {
  return { id: nextId('explosion'), x, y, createdAt: now }
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialState(),
        status: 'lessonSelect',
        startedAt: performance.now(),
        levelStartedAt: 0,
      }

    case 'SELECT_LEVEL':
      if (state.status !== 'lessonSelect') return state
      if (action.levelIndex < 0 || action.levelIndex >= LEVELS.length) return state
      return {
        ...createInitialState(),
        levelIndex: action.levelIndex,
        status: 'levelBriefing',
        startedAt: state.startedAt,
      }

    case 'BEGIN_LEVEL':
      if (state.status !== 'levelBriefing') return state
      return {
        ...state,
        status: 'playing',
        levelStartedAt: performance.now(),
        mothershipNextCheckAt: performance.now() + randomMothershipCheckDelay(),
      }

    case 'RESET':
      return createInitialState()

    case 'SPAWN': {
      if (state.status !== 'playing') return state
      if (state.aliens.length >= MAX_ALIENS) return state
      const level = LEVELS[state.levelIndex]
      // Stop feeding in new aliens once enough are already in play (destroyed
      // or on screen) to clear the level, so the screen empties out naturally
      // instead of levelling up with a wall of aliens still descending.
      if (state.kills + state.aliens.length >= level.targetKills) return state
      const alien: Alien = {
        id: nextId('alien'),
        char: randomChar(level.allowedKeys),
        variant: randomVariant(state.levelIndex),
        x: randomX(),
        y: -ALIEN_SIZE,
      }
      return { ...state, aliens: [...state.aliens, alien] }
    }

    case 'TICK': {
      if (state.status !== 'playing') return state
      const level = LEVELS[state.levelIndex]
      const dyPx = level.descentSpeed * action.dt

      let shieldHp = state.shieldHp
      const survivors: Alien[] = []
      for (const alien of state.aliens) {
        const y = alien.y + dyPx
        if (y + ALIEN_SIZE >= SHIP_Y) {
          shieldHp = Math.max(0, shieldHp - HIT_DAMAGE)
        } else {
          survivors.push({ ...alien, y })
        }
      }

      const lasers = state.lasers.filter(
        (laser) => action.now - laser.createdAt < LASER_LIFETIME_MS,
      )
      const explosions = state.explosions.filter(
        (explosion) => action.now - explosion.createdAt < EXPLOSION_LIFETIME_MS,
      )

      if (shieldHp <= 0) {
        return {
          ...state,
          aliens: [],
          lasers,
          explosions,
          shieldHp: 0,
          status: 'gameOver',
          mothership: null,
        }
      }

      // Move the mothership along its lane and drop it once it exits the playfield.
      let mothership = state.mothership
      if (mothership) {
        const nextX = mothership.x + mothership.direction * MOTHERSHIP_SPEED * action.dt
        const exited =
          (mothership.direction === 1 && nextX > PLAYFIELD_WIDTH + MOTHERSHIP_WIDTH) ||
          (mothership.direction === -1 && nextX < -MOTHERSHIP_WIDTH)
        mothership = exited ? null : { ...mothership, x: nextX }
      }

      // Sporadically roll for a new mothership, but only while shields are low.
      let mothershipNextCheckAt = state.mothershipNextCheckAt
      if (action.now >= mothershipNextCheckAt) {
        if (!mothership && shieldHp < MOTHERSHIP_SHIELD_THRESHOLD) {
          mothership = spawnMothership(level.allowedKeys)
          mothershipNextCheckAt = action.now + randomMothershipCheckDelay()
        } else {
          mothershipNextCheckAt = action.now + MOTHERSHIP_RETRY_DELAY_MS
        }
      }

      return {
        ...state,
        aliens: survivors,
        lasers,
        explosions,
        shieldHp,
        mothership,
        mothershipNextCheckAt,
      }
    }

    case 'KEY_PRESS': {
      if (state.status !== 'playing') return state
      const { key } = action
      const now = performance.now()

      // Target the lowest (closest to the ship) alien matching this key.
      let targetIndex = -1
      let lowestY = -Infinity
      state.aliens.forEach((alien, index) => {
        if (alien.char === key && alien.y > lowestY) {
          lowestY = alien.y
          targetIndex = index
        }
      })

      const totalKeystrokes = state.totalKeystrokes + 1

      if (targetIndex === -1) {
        // No descending alien matches; see if the mothership does instead.
        if (state.mothership && state.mothership.char === key) {
          const laser: Laser = {
            id: nextId('laser'),
            x: state.mothership.x,
            fromY: SHIP_Y,
            toY: MOTHERSHIP_LASER_Y,
            createdAt: now,
          }
          const explosion = explosionAt(state.mothership.x, MOTHERSHIP_LASER_Y, now)

          return {
            ...state,
            mothership: null,
            lasers: [...state.lasers, laser],
            explosions: [...state.explosions, explosion],
            shipX: state.mothership.x,
            shieldHp: Math.min(100, state.shieldHp + MOTHERSHIP_SHIELD_RESTORE),
            score: state.score + MOTHERSHIP_SCORE_BONUS,
            correctKeystrokes: state.correctKeystrokes + 1,
            totalKeystrokes,
          }
        }

        // Misfire: no matching alien or mothership on screen for this key.
        return { ...state, totalKeystrokes }
      }

      const target = state.aliens[targetIndex]
      const impactY = target.y + ALIEN_SIZE / 2
      const laser: Laser = {
        id: nextId('laser'),
        x: target.x,
        fromY: SHIP_Y,
        toY: impactY,
        createdAt: now,
      }
      const explosion = explosionAt(target.x, impactY, now)

      const aliens = state.aliens.filter((_, index) => index !== targetIndex)
      const kills = state.kills + 1
      const score = state.score + 10
      const correctKeystrokes = state.correctKeystrokes + 1
      const level = LEVELS[state.levelIndex]

      if (kills >= level.targetKills) {
        const isLastLevel = state.levelIndex >= LEVELS.length - 1
        return {
          ...state,
          // Any aliens still descending are cleared immediately so the level
          // transition doesn't leave stragglers visible on screen.
          aliens: [],
          lasers: [...state.lasers, laser],
          explosions: [...state.explosions, explosion],
          shipX: target.x,
          score,
          correctKeystrokes,
          totalKeystrokes,
          levelIndex: isLastLevel ? state.levelIndex : state.levelIndex + 1,
          kills: isLastLevel ? kills : 0,
          status: isLastLevel ? 'gameOver' : 'levelBriefing',
          victory: isLastLevel,
        }
      }

      return {
        ...state,
        aliens,
        lasers: [...state.lasers, laser],
        explosions: [...state.explosions, explosion],
        shipX: target.x,
        score,
        kills,
        correctKeystrokes,
        totalKeystrokes,
      }
    }

    default:
      return state
  }
}
