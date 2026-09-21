import { KEYBOARD_ROWS, fingerLabel } from '../utils/keyboardLayout'

interface VisualKeyboardProps {
  /** Keys currently present among on-screen aliens; highlighted for the player. */
  activeKeys: string[]
}

/**
 * Static QWERTY reference keyboard with the current target key(s)
 * highlighted, plus a finger/hand hint. This is a read-only overlay —
 * clicking it does nothing; only the physical keyboard drives gameplay.
 */
export function VisualKeyboard({ activeKeys }: VisualKeyboardProps) {
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
            const isHomeRow = rowIndex === 2
            return (
              <div
                key={key}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded border font-mono text-sm uppercase transition-colors',
                  isActive
                    ? 'border-amber-400 bg-amber-400 text-slate-900 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
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
    </div>
  )
}
