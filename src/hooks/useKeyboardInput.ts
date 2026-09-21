import { useEffect } from 'react'
import type { GameStatus } from '../types/game'

/**
 * Captures global physical keydown events while the game is playing.
 * - Ignores repeated keydown events fired while a key is held down
 *   (`event.repeat`), so one physical press = one shot attempt.
 * - Normalizes to lowercase and only forwards single printable characters
 *   relevant to the trainer (letters and semicolon); modifiers, function
 *   keys, etc. are ignored.
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
