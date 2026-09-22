import type { LevelConfig } from '../../types/game'

interface LessonSelectProps {
  levels: LevelConfig[]
  onSelect: (levelIndex: number) => void
}

const lessonGoals = [
  'Find the F and J anchor bumps and build confidence.',
  'Add the middle fingers with balanced left and right targets.',
  'Practise reaching for the outer home-row fingers.',
  'Complete the home row and strengthen pinky control.',
  'Reach sideways from F and J to practise G and H.',
]

/** Lets learners choose a lesson before its finger-position briefing begins. */
export function LessonSelect({ levels, onSelect }: LessonSelectProps) {
  return (
    <section className="w-full max-w-3xl rounded-lg border border-slate-700 bg-slate-900/90 p-6 text-slate-100 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
        Choose your mission
      </p>
      <h2 className="mt-1 text-2xl font-bold">Which lesson would you like to practise?</h2>
      <p className="mt-2 text-sm text-slate-400">
        Pick any home-row lesson. You can replay an easier mission or jump straight to a key set
        you want to practise.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {levels.map((level, index) => (
          <button
            key={level.id}
            type="button"
            onClick={() => onSelect(index)}
            className="rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Mission {level.id}
            </span>
            <span className="mt-1 block text-lg font-bold text-slate-100">{level.label}</span>
            <span className="mt-2 block font-mono text-sm text-amber-300">
              {level.allowedKeys.map((key) => key.toUpperCase()).join('  ')}
            </span>
            <span className="mt-2 block text-xs text-slate-400">
              {lessonGoals[index] ?? 'Practise this key group with increasing challenge.'}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
