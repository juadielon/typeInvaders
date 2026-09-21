import type { LevelConfig } from '../../types/game'
import { fingerLabel } from '../../utils/keyboardLayout'

interface LevelBriefingProps {
  level: LevelConfig
  onBegin: () => void
}

const HOME_POSITION_GUIDE = [
  'Left hand: pinky on A, ring on S, middle on D and index on F.',
  'Right hand: index on J, middle on K, ring on L and pinky on ;.',
]

function movementInstruction(key: string): string {
  const finger = fingerLabel(key)
  if (key === 'g') {
    return 'Reach your left index sideways from F to G, press G, then return it to F.'
  }
  if (key === 'h') {
    return 'Reach your right index sideways from J to H, press H, then return it to J.'
  }
  return `Keep your ${finger.toLowerCase()} resting on ${key.toUpperCase()} and press it in place.`
}

/** Pauses the action so learners can prepare their hands for each level. */
export function LevelBriefing({ level, onBegin }: LevelBriefingProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 p-4">
      <section
        aria-labelledby="level-briefing-title"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-lg border border-emerald-400/70 bg-slate-900 p-6 text-slate-100 shadow-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
          Prepare for {level.label}
        </p>
        <h2 id="level-briefing-title" className="mt-2 text-2xl font-bold">
          Place your fingers on the Home Row
        </h2>

        <p className="mt-3 text-sm text-slate-300">
          The <strong className="text-slate-100">Home Row</strong> is the middle letter row of
          the keyboard: <span className="font-mono text-emerald-300">A S D F G H J K L ;</span>.
          The raised bumps on F and J help you find the correct position without looking down.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {HOME_POSITION_GUIDE.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
          <li>Rest both thumbs lightly on the spacebar.</li>
        </ul>

        <div className="mt-5 rounded-md border border-slate-700 bg-slate-950/60 p-4">
          <h3 className="font-semibold text-amber-300">What to expect</h3>
          <p className="mt-1 text-sm text-slate-300">
            {level.targetKills} aliens will descend using {level.allowedKeys
              .map((key) => key.toUpperCase())
              .join(', ')}
            . Type the matching letter before each alien reaches your ship. Later levels have
            faster spawns and movement.
          </p>
        </div>

        <div className="mt-5">
          <h3 className="font-semibold text-amber-300">How to press this level's keys</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            {level.allowedKeys.map((key) => (
              <li key={key} className="rounded bg-slate-800 px-3 py-2">
                <span className="font-mono font-bold text-emerald-300">{key.toUpperCase()}</span>
                {' - '}
                {movementInstruction(key)}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onBegin}
          className="mt-6 w-full rounded-md bg-emerald-400 px-4 py-3 font-bold text-slate-950 transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Begin {level.label}
        </button>
      </section>
    </div>
  )
}
