import type {
  Alien,
  AlienVariant,
  Explosion,
  Laser,
  Mothership,
  PlasmaBolt,
  ShieldFeedback,
} from '../types/game'
import {
  ALIEN_SIZE,
  MOTHERSHIP_HEIGHT,
  MOTHERSHIP_LANE_HEIGHT,
  MOTHERSHIP_WIDTH,
  MOTHERSHIP_Y,
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  SHIP_Y,
  PLASMA_BLOCK_WINDOW,
} from '../hooks/useGameLoop'

const alienStyles = {
  scout: {
    arm: 'bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
    body: 'inset-x-1 top-1 bottom-2 rounded-t-xl rounded-b-md border-emerald-300 bg-emerald-900/80 shadow-[0_0_10px_rgba(52,211,153,0.55)]',
    eyes: 'rounded-full bg-emerald-500',
    label: 'bottom-0.5 text-emerald-100',
  },
  brute: {
    arm: 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]',
    body: 'inset-x-0.5 top-2 bottom-2 rounded-md border-amber-300 bg-amber-900/80 shadow-[0_0_10px_rgba(252,211,77,0.55)]',
    eyes: 'rounded-sm bg-amber-500',
    label: 'bottom-0.5 text-amber-100',
  },
  trickster: {
    arm: 'bg-fuchsia-300 shadow-[0_0_6px_rgba(240,171,252,0.8)]',
    body: 'inset-x-2 top-2 bottom-2 rounded-full border-fuchsia-300 bg-fuchsia-900/80 shadow-[0_0_10px_rgba(240,171,252,0.55)]',
    eyes: 'rounded-full bg-fuchsia-500',
    label: 'bottom-0.5 text-fuchsia-100',
  },
  lurker: {
    arm: 'bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.8)]',
    body: 'inset-x-1 top-2 bottom-1 rounded-b-3xl rounded-t-sm border-cyan-300 bg-cyan-900/80 shadow-[0_0_10px_rgba(103,232,249,0.55)]',
    eyes: 'rounded-full bg-cyan-400',
    label: 'bottom-0.5 text-cyan-100',
  },
  warden: {
    arm: 'bg-rose-300 shadow-[0_0_6px_rgba(253,164,175,0.8)]',
    body: 'inset-x-0.5 top-1.5 bottom-2 rounded-t-md rounded-b-xl border-rose-300 bg-rose-900/80 shadow-[0_0_10px_rgba(253,164,175,0.55)]',
    eyes: 'rounded-sm bg-rose-400',
    label: 'bottom-0.5 text-rose-100',
  },
  giggler: {
    arm: 'bg-lime-300 shadow-[0_0_7px_rgba(190,242,100,0.85)]',
    body: 'inset-x-1 top-1 bottom-2 rounded-[45%] border-lime-300 bg-lime-900/80 shadow-[0_0_11px_rgba(190,242,100,0.6)]',
    eyes: 'rounded-full bg-white shadow-[0_0_3px_white]',
    label: 'bottom-0 z-30 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]',
  },
  noodle: {
    arm: 'bg-orange-300 shadow-[0_0_7px_rgba(253,186,116,0.85)]',
    body: 'inset-x-2.5 top-0 bottom-1 rounded-full border-orange-300 bg-orange-950/80 shadow-[0_0_11px_rgba(253,186,116,0.6)]',
    eyes: 'rounded-full bg-orange-200',
    label: 'bottom-1 text-orange-100',
  },
  disco: {
    arm: 'bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.9)]',
    body: 'inset-x-1 top-1 bottom-1 rounded-full border-violet-200 bg-gradient-to-br from-fuchsia-700 via-cyan-700 to-amber-500 shadow-[0_0_13px_rgba(232,121,249,0.8)]',
    eyes: 'rounded-sm bg-cyan-100',
    label: 'bottom-1 text-white',
  },
  moustachio: {
    arm: 'bg-sky-300 shadow-[0_0_7px_rgba(125,211,252,0.85)]',
    body: 'inset-x-0.5 top-1 bottom-2 rounded-t-full rounded-b-lg border-sky-300 bg-sky-950/80 shadow-[0_0_11px_rgba(125,211,252,0.6)]',
    eyes: 'rounded-full bg-sky-100',
    label: 'bottom-0.5 text-sky-100',
  },
  propeller: {
    arm: 'bg-red-300 shadow-[0_0_7px_rgba(252,165,165,0.85)]',
    body: 'inset-x-1 top-2 bottom-2 rounded-lg border-red-300 bg-red-950/80 shadow-[0_0_11px_rgba(252,165,165,0.6)]',
    eyes: 'rounded-sm bg-red-100',
    label: 'bottom-0.5 text-red-100',
  },
  jellybean: {
    arm: 'bg-pink-300 shadow-[0_0_7px_rgba(249,168,212,0.85)]',
    body: 'inset-x-1 top-0.5 bottom-1 rotate-6 rounded-[55%_40%_55%_40%] border-pink-300 bg-pink-950/80 shadow-[0_0_12px_rgba(249,168,212,0.65)]',
    eyes: 'rounded-full bg-yellow-200',
    label: 'bottom-1 text-pink-100',
  },
  cyclops: {
    arm: 'bg-teal-300 shadow-[0_0_7px_rgba(94,234,212,0.85)]',
    body: 'inset-x-1 top-1 bottom-1 rounded-[40%] border-teal-300 bg-teal-950/80 shadow-[0_0_12px_rgba(94,234,212,0.65)]',
    eyes: 'rounded-full bg-teal-100',
    label: 'bottom-1 text-teal-100',
  },
  crabster: {
    arm: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]',
    body: 'inset-x-0.5 top-2 bottom-1 rounded-[50%_50%_30%_30%] border-orange-400 bg-red-950/80 shadow-[0_0_12px_rgba(251,146,60,0.7)]',
    eyes: 'rounded-full bg-yellow-100',
    label: 'bottom-1 text-orange-100',
  },
  toaster: {
    arm: 'bg-slate-300 shadow-[0_0_7px_rgba(203,213,225,0.85)]',
    body: 'inset-x-0.5 top-2 bottom-1 rounded-md border-slate-300 bg-slate-600/90 shadow-[0_0_12px_rgba(203,213,225,0.65)]',
    eyes: 'rounded-sm bg-red-300',
    label: 'bottom-1 text-white',
  },
  partyKing: {
    arm: 'bg-yellow-300 shadow-[0_0_9px_rgba(253,224,71,0.95)]',
    body: 'inset-x-1 top-2 bottom-1 rounded-xl border-yellow-300 bg-purple-900/90 shadow-[0_0_14px_rgba(253,224,71,0.8)]',
    eyes: 'rounded-full bg-yellow-100',
    label: 'bottom-1 text-yellow-100',
  },
} satisfies Record<Alien['variant'], Record<'arm' | 'body' | 'eyes' | 'label', string>>

const alienMotion: Partial<Record<AlienVariant, string>> = {
  noodle: 'type-invader-noodle',
  disco: 'type-invader-disco',
  jellybean: 'type-invader-jellybean',
  partyKing: 'type-invader-party-king',
}

function AlienAccessories({ variant }: { variant: AlienVariant }) {
  switch (variant) {
    case 'giggler':
      return (
        <span
          aria-hidden="true"
          className="type-invader-giggler-smile absolute left-1/2 top-3 z-20 h-1.5 w-3 -translate-x-1/2 rounded-b-full border-b-2 border-lime-200"
        />
      )
    case 'noodle':
      return (
        <>
          <span className="type-invader-antenna absolute left-2 top-0 h-3 w-0.5 -rotate-12 bg-orange-300" />
          <span className="type-invader-antenna absolute left-1/2 -top-1 h-4 w-0.5 -translate-x-1/2 bg-orange-300" />
          <span className="type-invader-antenna absolute right-2 top-0 h-3 w-0.5 rotate-12 bg-orange-300" />
        </>
      )
    case 'disco':
      return (
        <>
          <span className="absolute -left-1 top-1 h-1.5 w-1.5 rotate-45 bg-yellow-200 shadow-[0_0_5px_white]" />
          <span className="absolute -right-1 top-5 h-1.5 w-1.5 rotate-45 bg-cyan-200 shadow-[0_0_5px_white]" />
          <span className="absolute left-1/2 -top-1 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-fuchsia-200 shadow-[0_0_5px_white]" />
        </>
      )
    case 'moustachio':
      return (
        <span
          aria-hidden="true"
          className="type-invader-moustache absolute left-1/2 top-2.5 z-20 flex -translate-x-1/2"
        >
          <span className="h-1.5 w-2.5 -rotate-12 rounded-bl-full rounded-tr-full bg-slate-950" />
          <span className="h-1.5 w-2.5 rotate-12 rounded-br-full rounded-tl-full bg-slate-950" />
        </span>
      )
    case 'propeller':
      return (
        <>
          <span className="absolute left-1/2 -top-1 h-3 w-0.5 -translate-x-1/2 bg-red-300" />
          <span className="type-invader-propeller absolute -top-1 left-1/2 z-20 h-1.5 w-8 -translate-x-1/2 rounded-full bg-red-200" />
        </>
      )
    case 'jellybean':
      return (
        <>
          <span className="absolute left-2 top-4 z-20 h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="absolute right-2 top-2 z-20 h-2 w-2 rounded-full bg-yellow-300" />
        </>
      )
    case 'cyclops':
      return (
        <span className="absolute left-1/2 top-2 z-20 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-white">
          <span className="type-invader-cyclops-eye h-2 w-2 rounded-full bg-teal-700" />
        </span>
      )
    case 'crabster':
      return (
        <>
          <span className="absolute -left-2 top-2 z-20 h-4 w-4 rotate-45 rounded-tl-full border-l-4 border-t-4 border-orange-400" />
          <span className="absolute -right-2 top-2 z-20 h-4 w-4 -rotate-45 rounded-tr-full border-r-4 border-t-4 border-orange-400" />
        </>
      )
    case 'toaster':
      return (
        <>
          <span className="absolute left-2 -top-1 h-4 w-3 rounded-t-full border border-amber-400 bg-amber-700" />
          <span className="absolute right-2 -top-2 h-4 w-3 rounded-t-full border border-amber-300 bg-amber-600" />
        </>
      )
    case 'partyKing':
      return (
        <>
          <span
            className="absolute -top-2 left-1/2 z-20 h-4 w-7 -translate-x-1/2 bg-yellow-300"
            style={{ clipPath: 'polygon(0 100%, 0 20%, 25% 65%, 50% 0, 75% 65%, 100% 20%, 100% 100%)' }}
          />
          <span className="absolute -left-1 top-1 h-1.5 w-1.5 rotate-45 bg-cyan-300" />
          <span className="absolute -right-1 top-3 h-1.5 w-1.5 rounded-full bg-pink-300" />
        </>
      )
    default:
      return null
  }
}

/** Alien variants that can launch plasma bolts, matching the reducer's launcher list. */
type PlasmaLauncherVariant = 'trickster' | 'warden'

/** Tints the plasma missile to match the alien variant that fired it. */
const plasmaStyles: Record<PlasmaLauncherVariant, Record<'body' | 'text' | 'flame' | 'fin', string>> = {
  trickster: {
    body: 'border-fuchsia-200 bg-fuchsia-900/80 shadow-[0_0_10px_3px_rgba(240,171,252,0.85)]',
    text: 'text-fuchsia-100',
    flame: 'from-fuchsia-400/80',
    fin: 'bg-fuchsia-300',
  },
  warden: {
    body: 'border-rose-200 bg-rose-900/80 shadow-[0_0_10px_3px_rgba(253,164,175,0.85)]',
    text: 'text-rose-100',
    flame: 'from-rose-400/80',
    fin: 'bg-rose-300',
  },
}

const mothershipStyles = {
  saucer: {
    hull: 'rounded-full border-violet-300 bg-violet-900/80 shadow-[0_0_12px_rgba(196,181,253,0.7)]',
    accent: 'inset-x-3 top-0.5 h-2 rounded-full bg-violet-400/70',
    label: 'text-violet-100',
  },
  cruiser: {
    hull: 'rounded-md border-cyan-300 bg-cyan-900/80 shadow-[0_0_12px_rgba(103,232,249,0.7)]',
    accent: 'inset-x-2 top-1 h-1.5 rounded-sm bg-cyan-400/70',
    label: 'text-cyan-100',
  },
  orb: {
    hull: 'rounded-full border-rose-300 bg-rose-900/80 shadow-[0_0_12px_rgba(253,164,175,0.7)]',
    accent: 'left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-300/70',
    label: 'text-rose-100',
  },
} satisfies Record<Mothership['variant'], Record<'hull' | 'accent' | 'label', string>>

interface GameAreaProps {
  aliens: Alien[]
  lasers: Laser[]
  explosions: Explosion[]
  plasmaBolts: PlasmaBolt[]
  shieldFeedback: ShieldFeedback | null
  shieldHp: number
  mothership: Mothership | null
  shipX: number
  targetWarning: 'outOfOrder' | null
}

/** Renders the playfield: descending aliens, laser hit animations, and the player ship. */
export function GameArea({
  aliens,
  lasers,
  explosions,
  plasmaBolts,
  shieldFeedback,
  shieldHp,
  mothership,
  shipX,
  targetWarning,
}: GameAreaProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
      style={{ width: PLAYFIELD_WIDTH, height: PLAYFIELD_HEIGHT }}
    >
      {/* Starfield-ish backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e293b_0%,transparent_60%)]" />

      {/* The mothership roams the reserved top lane, above the descending aliens. */}
      {mothership && (
        <div
          className="absolute"
          style={{
            width: MOTHERSHIP_WIDTH,
            height: MOTHERSHIP_HEIGHT,
            transform: `translate(${mothership.x - MOTHERSHIP_WIDTH / 2}px, ${MOTHERSHIP_Y}px)`,
          }}
        >
          <div
            className={`type-invader-mothership relative h-full w-full border-2 ${mothershipStyles[mothership.variant].hull}`}
          >
            {mothership.variant === 'cruiser' && (
              <>
                <span className="absolute -left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400/70" />
                <span className="absolute -right-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400/70" />
              </>
            )}
            <div className={`absolute ${mothershipStyles[mothership.variant].accent}`} />
            <div
              className={`absolute inset-0 z-10 flex items-center justify-center font-mono text-lg font-black uppercase drop-shadow-[0_1px_2px_rgba(2,6,23,1)] ${mothershipStyles[mothership.variant].label}`}
            >
              {mothership.char}
            </div>
          </div>
        </div>
      )}

      {aliens.map((alien) => {
        const style = alienStyles[alien.variant]
        return (
          <div
            key={alien.id}
            className="absolute"
            style={{
              width: ALIEN_SIZE,
              height: ALIEN_SIZE,
              transform: `translate(${alien.x - ALIEN_SIZE / 2}px, ${MOTHERSHIP_LANE_HEIGHT + alien.y}px)`,
            }}
          >
            <div className={`type-invader-alien relative h-full w-full ${alienMotion[alien.variant] ?? ''}`}>
              <AlienAccessories variant={alien.variant} />
              {alien.variant === 'trickster' && (
                <>
                  <span className="type-invader-antenna absolute left-3 top-0 h-3 w-0.5 origin-bottom -rotate-12 bg-fuchsia-400">
                    <span className="absolute -left-0.5 -top-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                  </span>
                  <span className="type-invader-antenna absolute right-3 top-0 h-3 w-0.5 origin-bottom rotate-12 bg-fuchsia-400">
                    <span className="absolute -left-0.5 -top-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                  </span>
                </>
              )}
              {alien.variant === 'warden' && (
                <>
                  <span className="absolute left-1 top-1 h-1.5 w-3 rounded-sm bg-rose-300/80" />
                  <span className="absolute right-1 top-1 h-1.5 w-3 rounded-sm bg-rose-300/80" />
                </>
              )}
              {alien.variant === 'lurker' && (
                <span className="type-invader-antenna absolute left-1/2 top-0 h-2.5 w-0.5 origin-bottom -translate-x-1/2 bg-cyan-300">
                  <span className="absolute -left-1 -top-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                </span>
              )}
              <span className={`type-invader-arm absolute left-0 top-3 h-3 w-1.5 rounded-full ${style.arm}`} />
              <span className={`type-invader-arm absolute right-0 top-3 h-3 w-1.5 rounded-full ${style.arm}`} />
              <div className={`absolute border-2 ${style.body}`}>
                {alien.variant === 'lurker' && (
                  <div className="absolute inset-x-1.5 top-1.5 h-1.5 rounded-full bg-cyan-400/90" />
                )}
                {alien.variant !== 'trickster' &&
                  alien.variant !== 'lurker' &&
                  alien.variant !== 'cyclops' && (
                  <div className="absolute inset-x-1 top-1 flex justify-center gap-2">
                    <span className={`h-1.5 w-1.5 ${style.eyes}`} />
                    <span className={`h-1.5 w-1.5 ${style.eyes}`} />
                  </div>
                  )}
                <div className={`absolute inset-x-0 text-center font-mono text-sm font-black uppercase leading-none ${style.label}`}>
                  {alien.char}
                </div>
              </div>
              <span className={`type-invader-leg absolute bottom-0 left-2 h-2 w-1.5 rounded-full ${style.arm}`} />
              <span className={`type-invader-leg absolute bottom-0 right-2 h-2 w-1.5 rounded-full ${style.arm}`} />
            </div>
          </div>
        )
      })}

      {plasmaBolts.map((bolt) => {
        const isUrgent = bolt.y >= SHIP_Y - PLASMA_BLOCK_WINDOW
        const style = plasmaStyles[bolt.sourceVariant as PlasmaLauncherVariant] ?? plasmaStyles.warden
        return (
          <div
            key={bolt.id}
            aria-label="Incoming plasma missile, press Space to fire at it"
            className="absolute -translate-x-1/2"
            style={{ left: bolt.x, top: MOTHERSHIP_LANE_HEIGHT + bolt.y }}
          >
            {/* Thruster flame trails opposite the direction of travel, at the tail end near the fins. */}
            <div
              className={`absolute left-1/2 -top-4 h-4 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t ${style.flame} to-transparent ${isUrgent ? 'animate-pulse' : ''}`}
            />
            {/* Small fins at the tail, opposite the nose, so the bolt reads as a missile. */}
            <span className={`absolute -top-0.5 left-0 h-2 w-1 -translate-x-1/2 -skew-y-12 ${style.fin}`} />
            <span className={`absolute -top-0.5 right-0 h-2 w-1 translate-x-1/2 skew-y-12 ${style.fin}`} />
            <div
              className={`type-invader-missile relative flex h-14 w-5 flex-col items-center justify-center gap-px border font-mono text-[7px] font-black uppercase leading-none ${style.body} ${isUrgent ? 'animate-pulse' : ''}`}
              style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 82%, 50% 100%, 0% 82%)' }}
            >
              {['s', 'p', 'a', 'c', 'e'].map((letter, index) => (
                <span key={index} className={style.text}>
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {targetWarning === 'outOfOrder' && (
        <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 rounded-md border border-amber-300 bg-slate-950/90 px-4 py-2 text-sm font-bold text-amber-200 shadow-lg">
          Target the lowest alien first!
        </div>
      )}
      {shieldFeedback === 'missed' && (
        <div className="pointer-events-none absolute bottom-14 left-1/2 -translate-x-1/2 rounded-md border border-red-300 bg-slate-950/90 px-4 py-2 text-sm font-bold text-red-200 shadow-lg">
          Plasma hit your shields!
        </div>
      )}
      {lasers.map((laser) => {
        const top = MOTHERSHIP_LANE_HEIGHT + Math.min(laser.fromY, laser.toY)
        const height = Math.abs(laser.fromY - laser.toY)
        return (
          // overflow-hidden clips the glow to these exact bounds, so it can't
          // bleed past the impact point and make the beam look like it overshot.
          <div
            key={laser.id}
            className="pointer-events-none absolute overflow-hidden"
            style={{ left: laser.x - 3, top, width: 6, height }}
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-t from-sky-400 to-sky-400/0 shadow-[0_0_6px_2px_rgba(56,189,248,0.7)]" />
          </div>
        )
      })}

      {/* A brief, minimal burst so a kill feels registered without stealing focus from typing. */}
      {explosions.map((explosion) => (
        <div
          key={explosion.id}
          className="pointer-events-none absolute"
          style={{
            width: ALIEN_SIZE,
            height: ALIEN_SIZE,
            transform: `translate(${explosion.x - ALIEN_SIZE / 2}px, ${MOTHERSHIP_LANE_HEIGHT + explosion.y - ALIEN_SIZE / 2}px)`,
          }}
        >
          <div className="type-invader-explosion h-full w-full rounded-full bg-[radial-gradient(circle,rgba(254,240,138,0.9)_0%,rgba(251,146,60,0.6)_45%,transparent_75%)]" />
        </div>
      ))}

      {/* The ship lines up with each target before firing. Damage appears as Shield HP falls. */}
      <div
        className="absolute h-8 w-12 -translate-x-1/2 transition-[left] duration-150 ease-out"
        style={{ left: shipX, top: MOTHERSHIP_LANE_HEIGHT + SHIP_Y }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-t-full border-2 border-sky-200 bg-sky-900/80 shadow-[0_0_8px_rgba(125,211,252,0.8)]" />
        <div className="absolute left-1/2 top-2 h-4 w-9 -translate-x-1/2 rounded-t-xl rounded-b-md border-2 border-sky-300 bg-sky-800/80 shadow-[0_0_12px_rgba(56,189,248,0.65)]" />
        <div className="absolute left-0 top-4 h-3 w-4 rounded-l-full border-2 border-sky-300 bg-sky-900/80 shadow-[0_0_8px_rgba(56,189,248,0.55)]" />
        <div className="absolute right-0 top-4 h-3 w-4 rounded-r-full border-2 border-sky-300 bg-sky-900/80 shadow-[0_0_8px_rgba(56,189,248,0.55)]" />
        <div className="absolute left-1/2 top-5 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-200 shadow-[0_0_8px_2px_rgba(125,211,252,0.8)]" />
        {shieldHp < 45 && <div className="absolute left-2 top-1 h-1 w-2 rotate-45 bg-red-300/80" />}
        {shieldHp < 25 && <div className="absolute right-2 top-3 h-1 w-3 -rotate-45 bg-red-300/80" />}
      </div>
    </div>
  )
}
