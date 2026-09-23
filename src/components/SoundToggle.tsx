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
      className="rounded-md border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-emerald-400 hover:text-emerald-300"
    >
      {enabled ? 'Sound on' : 'Sound off'}
    </button>
  )
}
