interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-slate-700 bg-slate-900/80 p-10 text-center text-slate-200">
      <h1 className="text-3xl font-bold text-emerald-300">Type Invaders</h1>
      <p className="max-w-md text-sm text-slate-400">
        Aliens are descending towards your spaceship. Each alien shows a
        letter: press that letter on your physical keyboard to fire at it.
      </p>
      <ul className="max-w-md list-disc space-y-1 pl-5 text-left text-xs text-slate-400">
        <li>
          Begin with F and J on the <strong className="text-slate-200">Home Row</strong>,
          the middle letter row of your keyboard.
        </li>
        <li>
          Watch the on-screen keyboard: the strongest amber key is the next letter to press,
          and its hint shows which finger to use.
        </li>
        <li>
          Your <strong className="text-slate-200">Shield</strong> is the spaceship's protection
          meter. It starts at 100%; an alien reaching the ship removes 10%, and the game ends
          at 0%.
        </li>
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
