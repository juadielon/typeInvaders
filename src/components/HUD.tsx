interface HUDProps {
  shieldHp: number
  score: number
  levelLabel: string
  wpm: number
  accuracy: number
}

/** Top status bar: Shield HP, Score, current Level, live WPM and accuracy. */
export function HUD({ shieldHp, score, levelLabel, wpm, accuracy }: HUDProps) {
  const shieldColour =
    shieldHp > 60 ? 'bg-emerald-500' : shieldHp > 30 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div
      className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-200"
      style={{ maxWidth: 760 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase text-slate-400">Shield</span>
        <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full ${shieldColour} transition-all duration-200`}
            style={{ width: `${shieldHp}%` }}
          />
        </div>
        <span className="w-9 text-xs text-slate-400">{shieldHp}%</span>
      </div>

      <div className="text-sm font-semibold">{levelLabel}</div>

      <div className="flex items-center gap-4 text-sm">
        <span>
          Score <span className="font-mono font-bold text-sky-300">{score}</span>
        </span>
        <span>
          WPM <span className="font-mono font-bold text-sky-300">{wpm}</span>
        </span>
        <span>
          Acc <span className="font-mono font-bold text-sky-300">{accuracy}%</span>
        </span>
      </div>
    </div>
  )
}
