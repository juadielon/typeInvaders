import type { Alien, Explosion, Laser, Mothership } from '../types/game'
import {
  ALIEN_SIZE,
  MOTHERSHIP_HEIGHT,
  MOTHERSHIP_LANE_HEIGHT,
  MOTHERSHIP_WIDTH,
  MOTHERSHIP_Y,
  PLAYFIELD_HEIGHT,
  PLAYFIELD_WIDTH,
  SHIP_Y,
} from '../hooks/useGameLoop'

const alienStyles = {
  scout: {
    arm: 'bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
    body: 'inset-x-1 top-1 bottom-2 rounded-t-xl rounded-b-md border-emerald-300 bg-emerald-900/80 shadow-[0_0_10px_rgba(52,211,153,0.55)]',
    eyes: 'left-2 top-1.5 h-2 w-2 rounded-full bg-emerald-100 shadow-[12px_0_0_#d1fae5]',
    label: 'bottom-0.5 text-emerald-100',
  },
  brute: {
    arm: 'bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.8)]',
    body: 'inset-x-0.5 top-2 bottom-2 rounded-md border-amber-300 bg-amber-900/80 shadow-[0_0_10px_rgba(252,211,77,0.55)]',
    eyes: 'left-1.5 top-1.5 h-2 w-2 rounded-sm bg-amber-100 shadow-[14px_0_0_#fef3c7]',
    label: 'bottom-0.5 text-amber-100',
  },
  trickster: {
    arm: 'bg-fuchsia-300 shadow-[0_0_6px_rgba(240,171,252,0.8)]',
    body: 'inset-x-2 top-0.5 bottom-2 rounded-full border-fuchsia-300 bg-fuchsia-900/80 shadow-[0_0_10px_rgba(240,171,252,0.55)]',
    eyes: 'left-2 top-1.5 h-2 w-2 rounded-full bg-fuchsia-100 shadow-[12px_0_0_#fae8ff]',
    label: 'bottom-0.5 text-fuchsia-100',
  },
} satisfies Record<Alien['variant'], Record<'arm' | 'body' | 'eyes' | 'label', string>>

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
  mothership: Mothership | null
  shipX: number
}

/** Renders the playfield: descending aliens, laser hit animations, and the player ship. */
export function GameArea({ aliens, lasers, explosions, mothership, shipX }: GameAreaProps) {
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
            <div className="type-invader-alien relative h-full w-full">
              <span className={`type-invader-arm absolute left-0 top-3 h-3 w-1.5 rounded-full ${style.arm}`} />
              <span className={`type-invader-arm absolute right-0 top-3 h-3 w-1.5 rounded-full ${style.arm}`} />
              <div className={`absolute border-2 ${style.body}`}>
                <div className={`absolute ${style.eyes}`} />
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

      {/* The ship lines up with each target before firing. */}
      <div
        className="absolute h-8 w-12 -translate-x-1/2 transition-[left] duration-150 ease-out"
        style={{ left: shipX, top: MOTHERSHIP_LANE_HEIGHT + SHIP_Y }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-t-full border-2 border-sky-200 bg-sky-900/80 shadow-[0_0_8px_rgba(125,211,252,0.8)]" />
        <div className="absolute left-1/2 top-2 h-4 w-9 -translate-x-1/2 rounded-t-xl rounded-b-md border-2 border-sky-300 bg-sky-800/80 shadow-[0_0_12px_rgba(56,189,248,0.65)]" />
        <div className="absolute left-0 top-4 h-3 w-4 rounded-l-full border-2 border-sky-300 bg-sky-900/80 shadow-[0_0_8px_rgba(56,189,248,0.55)]" />
        <div className="absolute right-0 top-4 h-3 w-4 rounded-r-full border-2 border-sky-300 bg-sky-900/80 shadow-[0_0_8px_rgba(56,189,248,0.55)]" />
        <div className="absolute left-1/2 top-5 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-200 shadow-[0_0_8px_2px_rgba(125,211,252,0.8)]" />
      </div>
    </div>
  )
}
