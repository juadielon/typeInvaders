interface MissionCompleteScreenProps {
  levelNumber: number
  nextLevelNumber?: number
  isLastLevel: boolean
  score: number
  wpm: number
  accuracy: number
  onRetry: () => void
  onContinue: () => void
}

export function MissionCompleteScreen({
  levelNumber,
  nextLevelNumber,
  isLastLevel,
  score,
  wpm,
  accuracy,
  onRetry,
  onContinue,
}: MissionCompleteScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-emerald-500/50 bg-slate-900/95 p-10 text-center text-slate-200">
      <h2 className="text-2xl font-bold text-emerald-300">Mission {levelNumber} Complete!</h2>
      <p className="text-sm text-slate-400">
        Retry this mission for more practice, or continue when you are ready.
      </p>
      <div className="flex gap-6 text-sm">
        <span>
          Score <span className="font-mono font-bold text-sky-300">{score}</span>
        </span>
        <span>
          WPM <span className="font-mono font-bold text-sky-300">{wpm}</span>
        </span>
        <span>
          Accuracy <span className="font-mono font-bold text-sky-300">{accuracy}%</span>
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onRetry}
          className="rounded-md bg-amber-400 px-6 py-2 font-semibold text-slate-950 transition-colors hover:bg-amber-300"
        >
          Retry Mission
        </button>
        <button
          onClick={onContinue}
          className="rounded-md bg-emerald-500 px-6 py-2 font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
        >
          {isLastLevel ? 'Finish Curriculum' : `Continue to Mission ${nextLevelNumber}`}
        </button>
      </div>
    </div>
  )
}
