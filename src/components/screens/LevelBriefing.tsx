import { ALIEN_VARIANT_LABELS, type LevelConfig } from '../../types/game'
import { KEYBOARD_ROWS, fingerLabel } from '../../utils/keyboardLayout'

interface LevelBriefingProps {
  level: LevelConfig
  onBegin: () => void
}

const HOME_ROW = KEYBOARD_ROWS[1]

/** The Home Row key in the same finger column as `key`, used to describe reaches. */
function homeRowAnchorFor(key: string): string | undefined {
  const rowIndex = KEYBOARD_ROWS.findIndex((row) => row.includes(key))
  if (rowIndex === -1) return undefined
  const columnIndex = KEYBOARD_ROWS[rowIndex].indexOf(key)
  return HOME_ROW[columnIndex]
}

function movementInstruction(key: string): string {
  const finger = fingerLabel(key)
  const rowIndex = KEYBOARD_ROWS.findIndex((row) => row.includes(key))

  if (rowIndex === 1) {
    if (key === 'g') {
      return 'Reach your left index sideways from F to G, press G, then return it to F.'
    }
    if (key === 'h') {
      return 'Reach your right index sideways from J to H, press H, then return it to J.'
    }
    return `Keep your ${finger.toLowerCase()} resting on ${key.toUpperCase()} and press it in place.`
  }

  const anchor = homeRowAnchorFor(key)
  const direction = rowIndex === 0 ? 'up' : 'down'
  if (!anchor) {
    return `Reach your ${finger.toLowerCase()} ${direction} to ${key.toUpperCase()}, press it, then return to the Home Row.`
  }
  return `Reach your ${finger.toLowerCase()} ${direction} from ${anchor.toUpperCase()} to ${key.toUpperCase()}, press it, then return to ${anchor.toUpperCase()}.`
}

/** Pauses the action so learners can prepare their hands for each level. */
export function LevelBriefing({ level, onBegin }: LevelBriefingProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90">
      <section
        aria-labelledby="level-briefing-title"
        className="h-full w-full overflow-y-auto rounded-lg border border-emerald-400/70 bg-slate-900 p-4 text-slate-100 shadow-xl"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
          Prepare for {level.label}
        </p>
        <h2 id="level-briefing-title" className="mt-1 text-2xl font-bold">
          Place your fingers on the Home Row
        </h2>

        <p className="mt-2 text-sm text-slate-300">
          The <strong className="text-slate-100">Home Row</strong> is the middle letter row of
          the keyboard: <span className="font-mono text-emerald-300">A S D F G H J K L ;</span>.
          The raised bumps on F and J help you find the correct position without looking down.
        </p>

        <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <li className="rounded border border-slate-700 bg-slate-800/60 px-3 py-2">
            <strong className="block text-emerald-300">Left hand</strong>
            Pinky on A, ring on S, middle on D and index on F.
          </li>
          <li className="rounded border border-slate-700 bg-slate-800/60 px-3 py-2">
            <strong className="block text-emerald-300">Right hand</strong>
            Index on J, middle on K, ring on L and pinky on ;.
          </li>
          <li className="rounded border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-center sm:col-span-2">
            Rest both thumbs lightly on the spacebar.
          </li>
        </ul>

        <div className="mt-3 rounded-md border border-slate-700 bg-slate-950/60 p-3">
          <h3 className="font-semibold text-amber-300">What to expect</h3>
          <p className="mt-1 text-sm text-slate-300">
            {level.targetKills} aliens will descend using {level.allowedKeys
              .map((key) => key.toUpperCase())
              .join(', ')}
            . Type the matching letter before each alien reaches your ship. Spawns start gently
            and speed up as the lesson goes on, and the lesson bar at the top shows how many
            aliens are left before the level ends.
          </p>
          <p className="mt-1.5 text-sm text-slate-300">
            New this level:{' '}
            <strong className="text-emerald-300">{ALIEN_VARIANT_LABELS[level.newAlien]}</strong>{' '}
            aliens join the fleet alongside the species you have already faced.
          </p>
        </div>

        <div className="mt-3">
          <h3 className="font-semibold text-amber-300">How to press this level's keys</h3>
          <ul className="mt-1.5 grid gap-1.5 text-xs text-slate-300 sm:grid-cols-2">
            {level.allowedKeys.map((key) => (
              <li key={key} className="rounded bg-slate-800 px-2.5 py-1.5">
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
          className="mt-4 w-full rounded-md bg-emerald-400 px-4 py-2 font-bold text-slate-950 transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Begin {level.label}
        </button>
      </section>
    </div>
  )
}
