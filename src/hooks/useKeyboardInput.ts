import { useEffect } from 'react'
import type { GameStatus } from '../types/game'

/**
 * Listens for physical keydown events while the game is playing.
 * Ignores repeats (holding a key down shouldn't fire twice) and anything
 * that isn't a plain letter or semicolon, so modifier/function keys don't
 * count as a shot.
 */
export function useKeyboardInput(status: GameStatus, onKey: (key: string) => void) {
  useEffect(() => {
    if (status !== 'playing') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.ctrlKey || event.altKey || event.metaKey) return

      const key = event.key.toLowerCase()
      if (key.length !== 1) return
      if (!/^[a-z;]$/.test(key)) return

      onKey(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, onKey])
}
