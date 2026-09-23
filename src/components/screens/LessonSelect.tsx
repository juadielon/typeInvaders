import type { LevelConfig } from '../../types/game'

interface LessonSelectProps {
  levels: LevelConfig[]
  onSelect: (levelIndex: number) => void
}

const lessonGoals: Record<number, string> = {
  1: 'Find the F and J anchor bumps and build confidence.',
  2: 'Add the middle fingers with balanced left and right targets.',
  3: 'Practise reaching for the outer home-row fingers.',
  4: 'Complete the home row and strengthen pinky control.',
  5: 'Reach sideways from F and J to practise G and H.',
  6: 'Reach up to R and U while keeping your other fingers anchored.',
  7: 'Stretch your middle fingers up to E and I.',
  8: 'Reach your pinkies up to Q and P.',
  9: 'Bring your ring fingers up to W and O.',
  10: 'Finish the top row with T and Y, completing every letter above home.',
  11: 'Reach down to V and M with your index fingers.',
  12: 'Stretch your middle fingers down to C and the comma.',
  13: 'Reach your pinkies down to Z and the forward slash.',
  14: 'Bring your ring fingers down to X and the full stop.',
  15: 'Complete the keyboard with B and N, the final reach for each index finger.',
}

const formationGoals: Record<number, string> = {
  16: 'Build short words from the home-row keys you have released.',
  17: 'Build longer words that mix home-row keys with your first reaches.',
  18: 'Build longer recognisable words using the full top-row set.',
  19: 'Build longer words that include your new bottom-row reaches.',
  20: 'Build words using the complete letter and punctuation curriculum.',
}

/** Lets learners choose a lesson before its finger-position briefing begins. */
export function LessonSelect({ levels, onSelect }: LessonSelectProps) {
  return (
    <section className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-900/90 p-6 text-slate-100 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
        Choose your mission
      </p>
      <h2 className="mt-1 text-2xl font-bold">Which lesson would you like to practise?</h2>
      <p className="mt-2 text-sm text-slate-400">
        The keyboard has three letter rows: the <strong className="text-slate-200">Home Row</strong>{' '}
        in the middle, the <strong className="text-slate-200">Top Row</strong> above it and the{' '}
        <strong className="text-slate-200">Bottom Row</strong> below it. If you are new to touch
        typing, start with Mission 1. Otherwise, choose any group of keys you want to practise.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {levels.map((level, index) => {
          const isFormation = level.kind === 'wordFormation'
          return (
          <button
            key={level.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`rounded-lg border p-4 text-left transition-colors focus:outline-none focus:ring-2 ${
              isFormation
                ? 'border-violet-500/70 bg-violet-950/30 hover:border-violet-300 hover:bg-violet-900/40 focus:ring-violet-300'
                : 'border-slate-700 bg-slate-950/70 hover:border-emerald-400 hover:bg-slate-800 focus:ring-emerald-300'
            }`}
          >
            <span className={`text-xs font-semibold uppercase tracking-wider ${isFormation ? 'text-violet-300' : 'text-emerald-300'}`}>
              {isFormation ? 'Word Formation' : `Mission ${level.id}`}
            </span>
            <span className="mt-1 block text-lg font-bold text-slate-100">{level.label}</span>
            <span className="mt-2 block font-mono text-sm text-amber-300">
              {level.allowedKeys.map((key) => key.toUpperCase()).join('  ')}
            </span>
            <span className="mt-2 block text-xs text-slate-400">
              {isFormation
                ? `${formationGoals[level.id]} ${level.wordTarget} formations to clear.`
                : lessonGoals[level.id] ?? 'Practise this key group with increasing challenge.'}
            </span>
            {isFormation && <span className="mt-2 block text-xl" aria-hidden="true">✦</span>}
          </button>
          )
        })}
      </div>
    </section>
  )
}
