interface SoundToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute sound effects' : 'Unmute sound effects'}
      onClick={() => onChange(!enabled)}
      className={[
        'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
        enabled
          ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.55)]'
          : 'border-slate-600 bg-slate-900/80 text-slate-400',
        'hover:border-emerald-400 hover:text-emerald-300',
      ].join(' ')}
    >
      {enabled ? 'Sound on' : 'Sound off'}
    </button>
  )
}
