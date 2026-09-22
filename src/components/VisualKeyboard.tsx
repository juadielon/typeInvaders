import { KEYBOARD_ROWS, fingerLabel } from '../utils/keyboardLayout'

interface VisualKeyboardProps {
  /** Keys currently present among on-screen aliens; highlighted for the player. */
  activeKeys: string[]
  /** Key carried by the alien closest to the spaceship. */
  primaryKey?: string
  /** True while a plasma bolt is inbound and the Spacebar should be highlighted. */
  spaceActive?: boolean
}

/**
 * Static QWERTY reference keyboard with the current target key(s)
 * highlighted, plus a finger/hand hint. This is a read-only overlay —
 * clicking it does nothing; only the physical keyboard drives gameplay.
 */
export function VisualKeyboard({
  activeKeys,
  primaryKey,
  spaceActive = false,
}: VisualKeyboardProps) {
  const activeSet = new Set(activeKeys)
  const hints = activeKeys
    .map((key) => `${key.toUpperCase()} → ${fingerLabel(key)}`)
    .filter((hint) => !hint.endsWith('→ '))

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((key) => {
            const isActive = activeSet.has(key)
            const isPrimary = key === primaryKey
            const isHomeRow = rowIndex === 1
            return (
              <div
                key={key}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded border font-mono text-sm uppercase transition-colors',
                  isPrimary
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
      <div className="mt-1 h-5 text-xs text-slate-400">
        {hints.length > 0 ? hints.join('   |   ') : 'Watch for highlighted keys above'}
      </div>
      <div
        aria-label={spaceActive ? 'Press Space to fire at the plasma missile' : 'Spacebar'}
        className={[
          'flex h-9 w-40 items-center justify-center rounded border font-mono text-sm uppercase transition-colors',
          spaceActive
            ? 'border-orange-400 bg-orange-400 text-slate-900 shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse'
            : 'border-slate-700 bg-slate-800/50 text-slate-500',
        ].join(' ')}
      >
        space
      </div>
    </div>
  )
}
