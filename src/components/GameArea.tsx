import type { Alien, Laser } from '../types/game'
import { ALIEN_SIZE, PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH, SHIP_Y } from '../hooks/useGameLoop'

interface GameAreaProps {
  aliens: Alien[]
  lasers: Laser[]
  shipX: number
}

/** Renders the playfield: descending aliens, laser hit animations, and the player ship. */
export function GameArea({ aliens, lasers, shipX }: GameAreaProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
      style={{ width: PLAYFIELD_WIDTH, height: PLAYFIELD_HEIGHT }}
    >
      {/* Starfield-ish backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e293b_0%,transparent_60%)]" />

      {aliens.map((alien) => (
        <div
          key={alien.id}
          className="absolute"
          style={{
            width: ALIEN_SIZE,
            height: ALIEN_SIZE,
            transform: `translate(${alien.x - ALIEN_SIZE / 2}px, ${alien.y}px)`,
          }}
        >
          <div className="type-invader-alien relative h-full w-full">
            <span className="type-invader-arm absolute left-0 top-3 h-3 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="type-invader-arm absolute right-0 top-3 h-3 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <div className="absolute inset-x-1 top-1 bottom-2 rounded-t-xl rounded-b-md border-2 border-emerald-300 bg-emerald-900/80 shadow-[0_0_10px_rgba(52,211,153,0.55)]">
              <div className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-slate-950 shadow-[12px_0_0_#020617]" />
              <div className="absolute inset-x-0 bottom-2 text-center font-mono text-base font-black uppercase leading-none text-emerald-100">
                {alien.char}
              </div>
            </div>
            <span className="type-invader-leg absolute bottom-0 left-2 h-2 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="type-invader-leg absolute bottom-0 right-2 h-2 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>
        </div>
      ))}

      {lasers.map((laser) => (
        <div
          key={laser.id}
          className="absolute w-0.5 bg-sky-400 shadow-[0_0_8px_2px_rgba(56,189,248,0.8)]"
          style={{
            left: laser.x,
            top: Math.min(laser.fromY, laser.toY),
            height: Math.abs(laser.fromY - laser.toY),
          }}
        />
      ))}

      {/* The ship lines up with each target before firing. */}
      <div
        className="absolute -translate-x-1/2 border-x-[16px] border-b-[24px] border-x-transparent border-b-sky-400 transition-[left] duration-150 ease-out"
        style={{ left: shipX, top: SHIP_Y }}
      />
    </div>
  )
}
