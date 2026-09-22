import type { Alien } from '../types/game'

export interface AlienKeyPriority {
  activeKeys: string[]
  primaryKey?: string
}

/** Orders visible keys with the alien closest to the spaceship first. */
export function getAlienKeyPriority(aliens: Alien[]): AlienKeyPriority {
  const closestAlien = aliens.reduce<Alien | undefined>(
    (closest, alien) => (!closest || alien.y > closest.y ? alien : closest),
    undefined,
  )
  const primaryKey = closestAlien?.char
  const otherKeys = Array.from(
    new Set(aliens.map((alien) => alien.char).filter((key) => key !== primaryKey)),
  )

  return {
    activeKeys: primaryKey ? [primaryKey, ...otherKeys] : otherKeys,
    primaryKey,
  }
}
