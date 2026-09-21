interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-slate-700 bg-slate-900/80 p-10 text-center text-slate-200">
      <h1 className="text-3xl font-bold text-emerald-300">Type Invaders</h1>
      <p className="max-w-md text-sm text-slate-400">
        Aliens are descending! Type the letter shown on an alien to destroy it
        with your Home Row keys. Keep your Shield HP above 0 and clear each
        level to unlock new keys.
      </p>
      <ul className="max-w-md list-disc space-y-1 pl-5 text-left text-xs text-slate-400">
        <li>Rest your fingers on the Home Row: A S D F &nbsp; J K L ;</li>
        <li>Watch the keyboard overlay below the playfield for hints.</li>
        <li>An alien reaching the bottom costs you 10 Shield HP.</li>
      </ul>
      <button
        onClick={onStart}
        className="rounded-md bg-emerald-500 px-6 py-2 font-semibold text-slate-900 transition-colors hover:bg-emerald-400"
      >
        Start Game
      </button>
    </div>
  )
}
