import { useEffect } from 'react'
import type { GameStatus } from '../types/game'

/**
 * Listens for physical keydown events while the game is playing.
 * Ignores repeats (holding a key down shouldn't fire twice) and anything
 * that isn't a plain letter or one of the punctuation keys used by the
 * Bottom Row lessons (`;`, `,`, `.`, `/`), so modifier/function keys don't
 * count as a shot.
 */
export function useKeyboardInput(
  status: GameStatus,
  onKey: (key: string) => void,
  onSpace: () => void,
  onPauseToggle?: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.ctrlKey || event.altKey || event.metaKey) return

      if (event.key === 'Escape') {
        if (status === 'playing' || status === 'paused') {
          event.preventDefault()
          onPauseToggle?.()
        }
        return
      }

      if (status !== 'playing') return

      if (event.key === ' ') {
        event.preventDefault()
        onSpace()
        return
      }

      const key = event.key.toLowerCase()
      if (key.length !== 1) return
      if (!/^[a-z;,./]$/.test(key)) return

      onKey(key)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, onKey, onSpace, onPauseToggle])
}
