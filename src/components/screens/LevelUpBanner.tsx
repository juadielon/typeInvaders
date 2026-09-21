interface LevelUpBannerProps {
  label: string
}

/** Transient banner shown between levels while the game loop is paused. */
export function LevelUpBanner({ label }: LevelUpBannerProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-amber-400 bg-slate-900/90 p-10 text-center text-slate-200">
      <h2 className="text-2xl font-bold text-amber-300">Level Up!</h2>
      <p className="text-sm text-slate-300">{label}</p>
      <p className="text-xs text-slate-500">Get ready…</p>
    </div>
  )
}
