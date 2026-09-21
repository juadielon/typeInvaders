interface GameOverScreenProps {
  victory: boolean
  score: number
  wpm: number
  accuracy: number
  onRestart: () => void
}

export function GameOverScreen({ victory, score, wpm, accuracy, onRestart }: GameOverScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-900/90 p-10 text-center text-slate-200">
      <h2 className={`text-2xl font-bold ${victory ? 'text-emerald-300' : 'text-red-400'}`}>
        {victory ? 'You Win!' : 'Game Over'}
      </h2>
      <p className="text-sm text-slate-400">
        {victory
          ? 'You cleared every level. Great typing!'
          : 'Your shield ran out of power.'}
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
      <button
        onClick={onRestart}
        className="rounded-md bg-emerald-500 px-6 py-2 font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
      >
        Play Again
      </button>
    </div>
  )
}
