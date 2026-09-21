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
          className="absolute flex items-center justify-center rounded-md border-2 border-emerald-400 bg-emerald-900/60 font-mono text-lg font-bold uppercase text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          style={{
            width: ALIEN_SIZE,
            height: ALIEN_SIZE,
            transform: `translate(${alien.x - ALIEN_SIZE / 2}px, ${alien.y}px)`,
          }}
        >
          {alien.char}
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
