import type { Alien, GameStatus } from '../types/game'

export interface AlienKeyPriority {
  activeKeys: string[]
  primaryKey?: string
  primaryTargetId?: string
}

/** Orders visible keys with the alien closest to the spaceship first. */
export function getAlienKeyPriority(aliens: Alien[], wordFormation = false): AlienKeyPriority {
  const closestAlien = aliens.reduce<Alien | undefined>(
    (closest, alien) =>
      !closest ||
      (wordFormation ? alien.x < closest.x : alien.y > closest.y)
        ? alien
        : closest,
    undefined,
  )
  const primaryKey = closestAlien?.char
  const otherKeys = Array.from(
    new Set(aliens.map((alien) => alien.char).filter((key) => key !== primaryKey)),
  )

  return {
    activeKeys: primaryKey ? [primaryKey, ...otherKeys] : otherKeys,
    primaryKey,
    primaryTargetId: closestAlien?.id,
  }
}

/** Shows the full lesson key set during briefings, then live alien priority during play. */
export function getKeyboardHighlights(
  status: GameStatus,
  lessonKeys: string[],
  aliens: Alien[],
  wordFormation = false,
): AlienKeyPriority {
  if (status === 'levelBriefing') {
    return { activeKeys: lessonKeys, primaryKey: undefined, primaryTargetId: undefined }
  }

  return getAlienKeyPriority(aliens, wordFormation)
}
