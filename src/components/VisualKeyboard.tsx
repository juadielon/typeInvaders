import { useEffect, useRef, useState } from 'react'
import { KEYBOARD_ROWS, fingerLabel } from '../utils/keyboardLayout'

const REPEATED_TARGET_FLASH_MS = 140
const KEY_PRESS_FLASH_MS = 150

interface VisualKeyboardProps {
  /** Keys currently present among on-screen aliens; highlighted for the player. */
  activeKeys: string[]
  /** Key carried by the alien closest to the spaceship. */
  primaryKey?: string
  /** Identity of the closest alien, used to retrigger repeated-key guidance. */
  primaryTargetId?: string
  /** True while a plasma bolt is inbound and the Spacebar should be highlighted. */
  spaceActive?: boolean
  /** Whether to show concise key-to-finger guidance beneath the Spacebar. */
  showHints?: boolean
  /** Most recent physical keystroke, briefly flashed a hit/misfire colour. */
  lastKeyPress?: { id: string; key: string; correct: boolean } | null
  /** Active Word Formation word shown above the keyboard. */
  currentWord?: string | null
  /** Keeps the Word Formation hint row mounted while words change. */
  showWordHint?: boolean
}

/**
 * Static QWERTY reference keyboard with the current target key(s)
 * highlighted, plus a finger/hand hint. This is a read-only overlay —
 * clicking it does nothing; only the physical keyboard drives gameplay.
 */
export function VisualKeyboard({
  activeKeys,
  primaryKey,
  primaryTargetId,
  spaceActive = false,
  showHints = true,
  lastKeyPress,
  currentWord = null,
  showWordHint = false,
}: VisualKeyboardProps) {
  const previousTarget = useRef<{ id?: string; key?: string }>()
  const [suppressedKey, setSuppressedKey] = useState<string>()
  const [pressFlash, setPressFlash] = useState<{ key: string; correct: boolean }>()

  useEffect(() => {
    if (!lastKeyPress) {
      // A level reset (retry/continue) clears lastKeyPress while this
      // component stays mounted; without this the previous flash could
      // persist indefinitely into the new level until another key is pressed.
      setPressFlash(undefined)
      return
    }
    setPressFlash({ key: lastKeyPress.key, correct: lastKeyPress.correct })
    const timeoutId = window.setTimeout(() => setPressFlash(undefined), KEY_PRESS_FLASH_MS)
    return () => window.clearTimeout(timeoutId)
    // Only the id identifies a genuinely new keystroke; re-running this
    // effect for every render of the same press would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastKeyPress?.id])

  useEffect(() => {
    const previous = previousTarget.current
    previousTarget.current = { id: primaryTargetId, key: primaryKey }

    if (
      primaryKey &&
      primaryTargetId &&
      previous?.key === primaryKey &&
      previous.id !== primaryTargetId
    ) {
      setSuppressedKey(primaryKey)
      const timeoutId = window.setTimeout(
        () => setSuppressedKey(undefined),
        REPEATED_TARGET_FLASH_MS,
      )
      return () => window.clearTimeout(timeoutId)
    }

    setSuppressedKey(undefined)
  }, [primaryKey, primaryTargetId])

  const activeSet = new Set(activeKeys)
  const hints = activeKeys
    .map((key) => `${key.toUpperCase()} → ${fingerLabel(key)}`)
    .filter((hint) => !hint.endsWith('→ '))

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-3 max-[940px]:gap-0.5 max-[940px]:p-1">
      {showWordHint && (
        <div className="flex h-9 items-center max-[940px]:h-4">
          {currentWord && (
            <div
              aria-label={`Current word: ${currentWord}`}
              className="rounded border border-violet-400/70 bg-violet-950/70 px-2 py-0.5 font-mono text-xl font-bold tracking-[0.25em] text-violet-200 max-[940px]:px-1 max-[940px]:py-0 max-[940px]:text-xs max-[940px]:tracking-[0.1em]"
            >
              {currentWord}
            </div>
          )}
        </div>
      )}
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 max-[940px]:gap-0.5">
          {row.map((key) => {
            const isTemporarilySuppressed = key === suppressedKey
            const isActive = activeSet.has(key) && !isTemporarilySuppressed
            const isPrimary = key === primaryKey && !isTemporarilySuppressed
            const isHomeRow = rowIndex === 1
            const isPressed = pressFlash?.key === key
            return (
              <div
                key={key}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded border font-mono text-sm uppercase transition-colors max-[940px]:h-6 max-[940px]:w-6 max-[940px]:text-[10px]',
                  isPressed
                    ? pressFlash?.correct
                      ? 'border-emerald-400 bg-emerald-400 text-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.85)]'
                      : 'border-rose-500 bg-rose-500 text-slate-900 shadow-[0_0_10px_rgba(244,63,94,0.85)]'
                    : isPrimary
                      ? 'border-amber-400 bg-amber-400 text-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                      : isActive
                        ? 'border-amber-300 bg-amber-200 text-amber-950 shadow-[0_0_6px_rgba(253,230,138,0.45)]'
                      : isHomeRow
                        ? 'border-slate-500 bg-slate-800 text-slate-200'
                        : 'border-slate-700 bg-slate-800/50 text-slate-500',
                ].join(' ')}
              >
                {key}
              </div>
            )
          })}
        </div>
      ))}
      <div
        aria-label={spaceActive ? 'Press Space to fire at the plasma missile' : 'Spacebar'}
        className={[
          'flex h-9 w-40 items-center justify-center rounded border font-mono text-sm uppercase transition-colors max-[940px]:h-6 max-[940px]:w-24',
          spaceActive
            ? 'border-orange-400 bg-orange-400 text-slate-900 shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse'
            : 'border-slate-700 bg-slate-800/50 text-slate-500',
        ].join(' ')}
      >
        space
      </div>
      {showHints && (
        <div className="h-5 text-xs text-slate-400 max-[940px]:hidden">
          {hints.length > 0 ? hints.join('   |   ') : 'Watch for highlighted keys above'}
        </div>
      )}
    </div>
  )
}
