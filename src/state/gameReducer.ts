import { LEVELS } from '../data/levels'
import { ALIEN_VARIANTS, type Alien, type AlienVariant, type GameState, type Laser } from '../types/game'
import { ALIEN_SIZE, MAX_ALIENS, PLAYFIELD_WIDTH, SHIP_Y } from '../hooks/useGameLoop'

const HIT_DAMAGE = 20
const LASER_LIFETIME_MS = 250

export type Action =
  | { type: 'START_GAME' }
  | { type: 'TICK'; dt: number; now: number }
  | { type: 'SPAWN' }
  | { type: 'KEY_PRESS'; key: string }
  | { type: 'ADVANCE_LEVEL' }
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
    shipX: PLAYFIELD_WIDTH / 2,
    shieldHp: 100,
    score: 0,
    kills: 0,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    victory: false,
    startedAt: 0,
  }
}

function randomChar(allowedKeys: string[]): string {
  return allowedKeys[Math.floor(Math.random() * allowedKeys.length)]
}

function randomVariant(): AlienVariant {
  return ALIEN_VARIANTS[Math.floor(Math.random() * ALIEN_VARIANTS.length)]
}

function randomX(): number {
  const margin = ALIEN_SIZE
  return margin + Math.random() * (PLAYFIELD_WIDTH - margin * 2)
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialState(),
        status: 'playing',
        startedAt: performance.now(),
      }

    case 'RESET':
      return createInitialState()

    case 'SPAWN': {
      if (state.status !== 'playing') return state
      if (state.aliens.length >= MAX_ALIENS) return state
      const level = LEVELS[state.levelIndex]
      const alien: Alien = {
        id: nextId('alien'),
        char: randomChar(level.allowedKeys),
        variant: randomVariant(),
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

      if (shieldHp <= 0) {
        return {
          ...state,
          aliens: [],
          lasers,
          shieldHp: 0,
          status: 'gameOver',
        }
      }

      return { ...state, aliens: survivors, lasers, shieldHp }
    }

    case 'KEY_PRESS': {
      if (state.status !== 'playing') return state
      const { key } = action

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
        // Misfire: no matching alien on screen for this key.
        return { ...state, totalKeystrokes }
      }

      const target = state.aliens[targetIndex]
      const laser: Laser = {
        id: nextId('laser'),
        x: target.x,
        fromY: SHIP_Y,
        toY: target.y,
        createdAt: performance.now(),
      }

      const aliens = state.aliens.filter((_, index) => index !== targetIndex)
      const kills = state.kills + 1
      const score = state.score + 10
      const correctKeystrokes = state.correctKeystrokes + 1
      const level = LEVELS[state.levelIndex]

      if (kills >= level.targetKills) {
        const isLastLevel = state.levelIndex >= LEVELS.length - 1
        return {
          ...state,
          aliens,
          lasers: [...state.lasers, laser],
          shipX: target.x,
          score,
          kills,
          correctKeystrokes,
          totalKeystrokes,
          status: isLastLevel ? 'gameOver' : 'levelUp',
          victory: isLastLevel,
        }
      }

      return {
        ...state,
        aliens,
        lasers: [...state.lasers, laser],
        shipX: target.x,
        score,
        kills,
        correctKeystrokes,
        totalKeystrokes,
      }
    }

    case 'ADVANCE_LEVEL': {
      if (state.status !== 'levelUp') return state
      return {
        ...state,
        levelIndex: state.levelIndex + 1,
        aliens: [],
        lasers: [],
        kills: 0,
        status: 'playing',
      }
    }

    default:
      return state
  }
}
