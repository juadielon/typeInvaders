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
  type PlasmaBolt,
} from '../types/game'
import {
  ALIEN_SIZE,
  getAlienDescentSpeed,
  MAX_ALIENS,
  MOTHERSHIP_LANE_HEIGHT,
  MOTHERSHIP_WIDTH,
  PLAYFIELD_WIDTH,
  SHIP_Y,
  PLASMA_BOLT_DAMAGE,
  PLASMA_BOLT_SPEED,
  PLASMA_MAX_CHECK_DELAY_MS,
  PLASMA_MIN_CHECK_DELAY_MS,
} from '../hooks/useGameLoop'

const HIT_DAMAGE = 10
const LASER_LIFETIME_MS = 250
const EXPLOSION_LIFETIME_MS = 300
/** Shield HP cost for destroying an alien that wasn't the closest one to the ship. */
const PRIORITY_PENALTY = 5
const TARGET_WARNING_DURATION_MS = 900
const WORD_FORMATION_GAP = 52
/**
 * How long the playfield is held after the final alien of a level dies. Without
 * it the level would end on the same action that fires the shot, so the last
 * laser and explosion would never be drawn.
 */
export const LEVEL_CLEAR_DELAY_MS = 650

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
  | { type: 'SPACE_PRESS' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'QUIT_GAME' }
  | { type: 'BEGIN_LEVEL' }
  | { type: 'RETRY_LEVEL' }
  | { type: 'CONTINUE_LEVEL' }
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
    plasmaBolts: [],
    shieldFeedback: null,
    shieldFeedbackUntil: 0,
    shipX: PLAYFIELD_WIDTH / 2,
    shieldHp: 100,
    score: 0,
    kills: 0,
    hasSpawnedIntroAlien: false,
    currentWord: null,
    wordsCompleted: 0,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    victory: false,
    startedAt: 0,
    pausedAt: 0,
    mothership: null,
    mothershipNextCheckAt: 0,
    levelStartedAt: 0,
    levelCompletedAt: 0,
    nextPlasmaCheckAt: 0,
    targetWarning: null,
    targetWarningUntil: 0,
    audioEvent: null,
    alarmEvent: null,
    lastKeyPress: null,
  }
}

function randomChar(allowedKeys: string[]): string {
  return allowedKeys[Math.floor(Math.random() * allowedKeys.length)]
}

export function selectWordFormationWord(
  wordPool: string[],
  wordsCompleted: number,
  wordTarget: number,
): string | undefined {
  if (wordPool.length === 0) return undefined

  const orderedWords = [...wordPool].sort((first, second) => first.length - second.length)
  const progressSteps = Math.max(wordTarget - 1, 1)
  const progress = Math.min(Math.max(wordsCompleted, 0), progressSteps) / progressSteps
  const windowSize = Math.max(1, Math.ceil(orderedWords.length / Math.max(wordTarget, 1)))
  const windowStart = Math.min(
    Math.floor(progress * (orderedWords.length - windowSize)),
    orderedWords.length - windowSize,
  )
  const window = orderedWords.slice(windowStart, windowStart + windowSize)
  return window[Math.floor(Math.random() * window.length)]
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

function randomPlasmaCheckDelay(): number {
  return (
    PLASMA_MIN_CHECK_DELAY_MS +
    Math.random() * (PLASMA_MAX_CHECK_DELAY_MS - PLASMA_MIN_CHECK_DELAY_MS)
  )
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

function spawnPlasmaBolt(alien: Alien, now: number): PlasmaBolt {
  return {
    id: nextId('plasma'),
    x: alien.x,
    y: alien.y + ALIEN_SIZE / 2,
    createdAt: now,
    sourceVariant: alien.variant,
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
        nextPlasmaCheckAt: performance.now() + randomPlasmaCheckDelay(),
      }

    case 'RETRY_LEVEL':
      if (state.status !== 'levelResults' && state.status !== 'gameOver') return state
      return {
        ...createInitialState(),
        levelIndex: state.levelIndex,
        status: 'levelBriefing',
        startedAt: performance.now(),
      }

    case 'CONTINUE_LEVEL': {
      if (state.status !== 'levelResults') return state
      const isLastLevel = state.levelIndex >= LEVELS.length - 1
      return {
        ...state,
        levelIndex: isLastLevel ? state.levelIndex : state.levelIndex + 1,
        kills: isLastLevel ? state.kills : 0,
        // Word Formation progress and any leftover combat-only transients
        // (mothership, plasma bolts, warning banners) must not carry over
        // into the next mission — otherwise a stale wordsCompleted count can
        // shrink or skip the next formation's word bank, and a leftover
        // mothership/missile would sit frozen through a Word Formation
        // mission, whose TICK branch intentionally doesn't move them.
        currentWord: isLastLevel ? state.currentWord : null,
        wordsCompleted: isLastLevel ? state.wordsCompleted : 0,
        mothership: isLastLevel ? state.mothership : null,
        plasmaBolts: isLastLevel ? state.plasmaBolts : [],
        shieldFeedback: isLastLevel ? state.shieldFeedback : null,
        shieldFeedbackUntil: isLastLevel ? state.shieldFeedbackUntil : 0,
        targetWarning: isLastLevel ? state.targetWarning : null,
        targetWarningUntil: isLastLevel ? state.targetWarningUntil : 0,
        hasSpawnedIntroAlien: isLastLevel ? state.hasSpawnedIntroAlien : false,
        status: isLastLevel ? 'gameOver' : 'levelBriefing',
        victory: isLastLevel,
        levelStartedAt: 0,
        levelCompletedAt: 0,
      }
    }

    case 'PAUSE_GAME': {
      if (state.status !== 'playing') return state
      return {
        ...state,
        status: 'paused',
        pausedAt: performance.now(),
      }
    }

    case 'RESUME_GAME': {
      if (state.status !== 'paused') return state
      const now = performance.now()
      const elapsedPaused = Math.max(0, now - state.pausedAt)
      return {
        ...state,
        status: 'playing',
        pausedAt: 0,
        startedAt: state.startedAt + elapsedPaused,
        levelStartedAt: state.levelStartedAt + elapsedPaused,
        nextPlasmaCheckAt: state.nextPlasmaCheckAt + elapsedPaused,
        mothershipNextCheckAt: state.mothershipNextCheckAt + elapsedPaused,
        shieldFeedbackUntil: state.shieldFeedbackUntil > 0 ? state.shieldFeedbackUntil + elapsedPaused : 0,
        targetWarningUntil: state.targetWarningUntil > 0 ? state.targetWarningUntil + elapsedPaused : 0,
        levelCompletedAt: state.levelCompletedAt > 0 ? state.levelCompletedAt + elapsedPaused : 0,
      }
    }

    case 'QUIT_GAME':
      return {
        ...createInitialState(),
        status: 'lessonSelect',
        startedAt: performance.now(),
      }

    case 'RESET':
      return createInitialState()

    case 'SPAWN': {
      if (state.status !== 'playing') return state
      const level = LEVELS[state.levelIndex]
      if (level.kind === 'wordFormation') {
        if (state.aliens.length > 0 || state.wordsCompleted >= (level.wordTarget ?? 0)) {
          return state
        }
        const word = selectWordFormationWord(
          level.wordPool ?? [],
          state.wordsCompleted,
          level.wordTarget ?? 1,
        )
        if (!word) return state
        const formationVariants = variantsForLevel(state.levelIndex)
        const startX = PLAYFIELD_WIDTH / 2 - ((word.length - 1) * WORD_FORMATION_GAP) / 2
        const aliens = [...word].map((char, index) => ({
          id: nextId('alien'),
          char,
          variant:
            formationVariants[(state.wordsCompleted + 1) % formationVariants.length] ?? level.newAlien,
          x: startX + index * WORD_FORMATION_GAP,
          y: -ALIEN_SIZE,
        }))
        return { ...state, aliens, currentWord: word, hasSpawnedIntroAlien: true }
      }
      // Combat missions cap how many aliens can be in play at once; Word
      // Formation missions spawn a whole formation atomically above, so this
      // cap must not apply to them (a formation can be longer than MAX_ALIENS).
      if (state.aliens.length >= MAX_ALIENS) return state
      // Stop feeding in new aliens once enough are already in play (destroyed
      // or on screen) to clear the level, so the screen empties out naturally
      // instead of levelling up with a wall of aliens still descending.
      if (state.kills + state.aliens.length >= level.targetKills) return state
      const alien: Alien = {
        id: nextId('alien'),
        char: randomChar(level.allowedKeys),
        variant: state.hasSpawnedIntroAlien ? randomVariant(state.levelIndex) : level.newAlien,
        x: randomX(),
        y: -ALIEN_SIZE,
      }
      return {
        ...state,
        aliens: [...state.aliens, alien],
        hasSpawnedIntroAlien: true,
      }
    }

    case 'TICK': {
      const lasers = state.lasers.filter(
        (laser) => action.now - laser.createdAt < LASER_LIFETIME_MS,
      )
      let explosions = state.explosions.filter(
        (explosion) => action.now - explosion.createdAt < EXPLOSION_LIFETIME_MS,
      )

      // A cleared level keeps animating the final shot before showing the
      // results screen, where the learner chooses whether to retry or continue.
      if (state.status === 'levelComplete') {
        if (action.now - state.levelCompletedAt < LEVEL_CLEAR_DELAY_MS) {
          return { ...state, lasers, explosions }
        }

        return {
          ...state,
          lasers,
          explosions,
          status: 'levelResults',
          levelCompletedAt: 0,
        }
      }

      if (state.status !== 'playing') return state
      const level = LEVELS[state.levelIndex]
      const descentSpeed = getAlienDescentSpeed(level, action.now - state.levelStartedAt)
      const dyPx = descentSpeed * action.dt

      let shieldHp = state.shieldHp
      if (level.kind === 'wordFormation') {
        const y = state.aliens.map((alien) => ({ ...alien, y: alien.y + dyPx }))
        const reachedShip = y.some((alien) => alien.y + ALIEN_SIZE >= SHIP_Y)
        if (!reachedShip) return { ...state, aliens: y, lasers, explosions }
        shieldHp = Math.max(0, shieldHp - HIT_DAMAGE)
        return {
          ...state,
          aliens: [],
          currentWord: null,
          lasers,
          explosions,
          shieldHp,
          status: shieldHp <= 0 ? 'gameOver' : 'playing',
          wordsCompleted: state.wordsCompleted,
        }
      }
      const survivors: Alien[] = []
      for (const alien of state.aliens) {
        const y = alien.y + dyPx
        if (y + ALIEN_SIZE >= SHIP_Y) {
          shieldHp = Math.max(0, shieldHp - HIT_DAMAGE)
        } else {
          survivors.push({ ...alien, y })
        }
      }

      let plasmaBolts = state.plasmaBolts.map((bolt) => ({
        ...bolt,
        // Bolts gently home towards the ship, so moving the ship changes the
        // impact point instead of leaving the missile aimed at stale x data.
        x: bolt.x + (state.shipX - bolt.x) * Math.min(action.dt * 3, 1),
        y: bolt.y + PLASMA_BOLT_SPEED * action.dt,
      }))
      const missedBolt = plasmaBolts.find((bolt) => bolt.y >= SHIP_Y)
      let nextPlasmaCheckAt = state.nextPlasmaCheckAt
      let shieldFeedback = state.shieldFeedback
      let shieldFeedbackUntil = state.shieldFeedbackUntil
      if (shieldFeedbackUntil > 0 && action.now >= shieldFeedbackUntil) {
        shieldFeedback = null
        shieldFeedbackUntil = 0
      }
      let targetWarning = state.targetWarning
      let targetWarningUntil = state.targetWarningUntil
      if (targetWarningUntil > 0 && action.now >= targetWarningUntil) {
        targetWarning = null
        targetWarningUntil = 0
      }
      if (missedBolt) {
        plasmaBolts = plasmaBolts.filter((bolt) => bolt.id !== missedBolt.id)
        shieldHp = Math.max(0, shieldHp - PLASMA_BOLT_DAMAGE)
        explosions = [...explosions, explosionAt(state.shipX, SHIP_Y, action.now)]
        shieldFeedback = 'missed'
        shieldFeedbackUntil = action.now + 900
      }

      let alarmEvent = state.alarmEvent
      if (action.now >= nextPlasmaCheckAt) {
        const launchers = survivors.filter(
          (alien) => alien.variant === 'trickster' || alien.variant === 'warden',
        )
        // Don't launch a new missile (or its alarm) once shields are already
        // depleted - the bolt would be discarded immediately by the game-over
        // return below, leaving a phantom alarm for a missile that never appears.
        if (launchers.length > 0 && plasmaBolts.length === 0 && shieldHp > 0) {
          const launcher = launchers[Math.floor(Math.random() * launchers.length)]
          plasmaBolts = [...plasmaBolts, spawnPlasmaBolt(launcher, action.now)]
          alarmEvent = { id: nextId('audio') }
        }
        nextPlasmaCheckAt = action.now + randomPlasmaCheckDelay()
      }
      if (shieldHp <= 0) {
        return {
          ...state,
          aliens: [],
          lasers,
          explosions,
          plasmaBolts: [],
          shieldHp: 0,
          shieldFeedback: 'missed',
          shieldFeedbackUntil: action.now + 900,
          nextPlasmaCheckAt,
          status: 'gameOver',
          mothership: null,
          audioEvent: missedBolt
            ? { id: nextId('audio'), type: 'plasmaMissileImpact' }
            : state.audioEvent,
          alarmEvent,
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
        plasmaBolts,
        shieldHp,
        shieldFeedback,
        shieldFeedbackUntil,
        targetWarning,
        targetWarningUntil,
        nextPlasmaCheckAt,
        mothership,
        mothershipNextCheckAt,
        audioEvent: missedBolt
          ? { id: nextId('audio'), type: 'plasmaMissileImpact' }
          : state.audioEvent,
        alarmEvent,
      }
    }

    case 'KEY_PRESS': {
      if (state.status !== 'playing') return state
      const { key } = action
      const now = performance.now()
      const level = LEVELS[state.levelIndex]
      const totalKeystrokes = state.totalKeystrokes + 1

      if (level.kind === 'wordFormation') {
        const target = state.aliens.reduce<Alien | null>(
          (current, alien) => (!current || alien.x < current.x ? alien : current),
          null,
        )
        if (!target || target.char !== key) {
          return {
            ...state,
            totalKeystrokes,
            lastKeyPress: { id: nextId('key'), key, correct: false },
          }
        }

        const impactY = target.y + ALIEN_SIZE / 2
        const laser: Laser = {
          id: nextId('laser'),
          x: target.x,
          fromY: SHIP_Y,
          toY: impactY,
          createdAt: now,
        }
        const explosion = explosionAt(target.x, impactY, now)
        const aliens = state.aliens.filter((alien) => alien.id !== target.id)
        const wordComplete = aliens.length === 0
        const wordsCompleted = wordComplete ? state.wordsCompleted + 1 : state.wordsCompleted
        const completed = wordComplete && wordsCompleted >= (level.wordTarget ?? 0)
        return {
          ...state,
          aliens,
          currentWord: wordComplete ? null : state.currentWord,
          lasers: [...state.lasers, laser],
          explosions: [...state.explosions, explosion],
          shipX: target.x,
          score: state.score + 10,
          // Word Formation missions track progress via wordsCompleted, not
          // combat kills, so leave kills untouched here — otherwise a
          // completed formation would falsely report a full combat tally.
          correctKeystrokes: state.correctKeystrokes + 1,
          totalKeystrokes,
          wordsCompleted,
          status: completed ? 'levelComplete' : 'playing',
          levelCompletedAt: completed ? now : state.levelCompletedAt,
          audioEvent: { id: nextId('audio'), type: 'alienHit', variant: target.variant },
          lastKeyPress: { id: nextId('key'), key, correct: true },
        }
      }

      // Target the lowest (closest to the ship) alien matching this key.
      let targetIndex = -1
      let lowestY = -Infinity
      state.aliens.forEach((alien, index) => {
        if (alien.char === key && alien.y > lowestY) {
          lowestY = alien.y
          targetIndex = index
        }
      })

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
            audioEvent: { id: nextId('audio'), type: 'mothershipHit' },
            lastKeyPress: { id: nextId('key'), key, correct: true },
          }
        }

        // Misfire: no matching alien or mothership on screen for this key.
        return { ...state, totalKeystrokes, lastKeyPress: { id: nextId('key'), key, correct: false } }
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

      // The player must react to the alien closest to the ship first. Destroying
      // any other alien while a closer one is still descending costs a small
      // Shield penalty, so learners can't dodge the priority alien by picking
      // whichever letter is easiest for them.
      const closestY = Math.max(...state.aliens.map((alien) => alien.y))
      const isOutOfOrder = target.y < closestY
      const shieldHp = isOutOfOrder ? Math.max(0, state.shieldHp - PRIORITY_PENALTY) : state.shieldHp
      const targetWarning = isOutOfOrder ? 'outOfOrder' : null
      const targetWarningUntil = isOutOfOrder ? now + TARGET_WARNING_DURATION_MS : 0

      const aliens = state.aliens.filter((_, index) => index !== targetIndex)
      const kills = state.kills + 1
      const score = state.score + 10
      const correctKeystrokes = state.correctKeystrokes + 1
      if (shieldHp <= 0) {
        return {
          ...state,
          aliens: [],
          lasers: [...state.lasers, laser],
          explosions: [...state.explosions, explosion],
          shipX: target.x,
          score,
          kills,
          correctKeystrokes,
          totalKeystrokes,
          shieldHp: 0,
          targetWarning,
          targetWarningUntil,
          plasmaBolts: [],
          status: 'gameOver',
          mothership: null,
          audioEvent: { id: nextId('audio'), type: 'alienHit', variant: target.variant },
          lastKeyPress: { id: nextId('key'), key, correct: true },
        }
      }

      if (kills >= level.targetKills) {
        return {
          ...state,
          // Any aliens still descending are cleared immediately so the level
          // transition doesn't leave stragglers visible on screen.
          aliens: [],
          lasers: [...state.lasers, laser],
          explosions: [...state.explosions, explosion],
          shipX: target.x,
          score,
          kills,
          correctKeystrokes,
          totalKeystrokes,
          shieldHp,
          targetWarning: null,
          targetWarningUntil: 0,
          mothership: null,
          plasmaBolts: [],
          shieldFeedback: null,
          shieldFeedbackUntil: 0,
          // Hold the playfield so this final shot and explosion are seen; the
          // TICK handler then opens the mission results.
          status: 'levelComplete',
          levelCompletedAt: now,
          audioEvent: { id: nextId('audio'), type: 'alienHit', variant: target.variant },
          lastKeyPress: { id: nextId('key'), key, correct: true },
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
        shieldHp,
        targetWarning,
        targetWarningUntil,
        audioEvent: { id: nextId('audio'), type: 'alienHit', variant: target.variant },
        lastKeyPress: { id: nextId('key'), key, correct: true },
      }
    }

    case 'SPACE_PRESS': {
      if (state.status !== 'playing') return state
      const now = performance.now()
      const bolt = state.plasmaBolts[0]
      const totalKeystrokes = state.totalKeystrokes + 1

      if (!bolt) {
        // Misfire: pressing Space with no inbound missile counts against
        // accuracy, just like pressing a letter with no matching alien.
        return { ...state, totalKeystrokes }
      }

      // Firing at the plasma missile works exactly like shooting a lettered
      // alien: the ship glides to the target, fires a laser, and it explodes.
      const laser: Laser = {
        id: nextId('laser'),
        x: bolt.x,
        fromY: SHIP_Y,
        toY: bolt.y,
        createdAt: now,
      }
      const explosion = explosionAt(bolt.x, bolt.y, now)

      return {
        ...state,
        plasmaBolts: state.plasmaBolts.filter((b) => b.id !== bolt.id),
        lasers: [...state.lasers, laser],
        explosions: [...state.explosions, explosion],
        shipX: bolt.x,
        score: state.score + 5,
        correctKeystrokes: state.correctKeystrokes + 1,
        totalKeystrokes,
        audioEvent: { id: nextId('audio'), type: 'alienHit', variant: bolt.sourceVariant },
      }
    }
    default:
      return state
  }
}
