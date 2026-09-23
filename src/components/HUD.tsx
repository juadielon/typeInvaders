interface HUDProps {
  shieldHp: number
  score: number
  levelLabel: string
  wpm: number
  accuracy: number
  kills: number
  targetKills: number
  missionKind?: 'combat' | 'wordFormation'
  currentWord?: string | null
  wordsCompleted?: number
  wordTarget?: number
}

/**
 * Top status bar: Shield HP, lesson progress, Score, current Level, live WPM
 * and accuracy. Lesson progress tells the learner how much practice is left
 * before the level ends, so a longer lesson never feels open-ended.
 */
export function HUD({
  shieldHp,
  score,
  levelLabel,
  wpm,
  accuracy,
  kills,
  targetKills,
  missionKind = 'combat',
  currentWord = null,
  wordsCompleted = 0,
  wordTarget = 0,
}: HUDProps) {
  const shieldColour =
    shieldHp > 60 ? 'bg-emerald-500' : shieldHp > 30 ? 'bg-amber-500' : 'bg-red-500'
  const progressTarget = missionKind === 'wordFormation' ? wordTarget : targetKills
  const cleared = Math.min(missionKind === 'wordFormation' ? wordsCompleted : kills, progressTarget)
  const progressPercent = progressTarget === 0 ? 0 : Math.round((cleared / progressTarget) * 100)
  const remaining = Math.max(progressTarget - cleared, 0)

  return (
    <div
      className="flex w-full flex-col gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-slate-200"
      style={{ maxWidth: 760 }}
    >
      <div className="flex items-center justify-between">
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

        <div className="text-sm font-semibold">
          {missionKind === 'wordFormation' && (
            <span className="mr-2 rounded bg-violet-500/20 px-1.5 py-0.5 text-xs uppercase tracking-wider text-violet-300">
              Word Formation
            </span>
          )}
          {levelLabel}
        </div>

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

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase text-slate-400">Lesson</span>
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={progressTarget}
          aria-valuenow={cleared}
        >
          <div
            className="h-full bg-emerald-400 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-slate-400">
          <span className="font-mono font-bold text-emerald-300">{cleared}</span>
          {' / '}
          {missionKind === 'wordFormation' ? `${wordTarget} words` : `${targetKills} aliens`}
        </span>
        <span className="w-24 text-right text-xs text-slate-400">
          {remaining === 0 ? 'Lesson complete' : `${remaining} to finish`}
        </span>
      </div>
      {missionKind === 'wordFormation' && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="uppercase tracking-wider text-violet-300">Formation</span>
          <span className="font-mono text-lg font-bold tracking-[0.35em] text-violet-100">
            {currentWord ?? '...'}
          </span>
          <span className="text-xs text-slate-400">
            {wordsCompleted} / {wordTarget} words
          </span>
        </div>
      )}
    </div>
  )
}
