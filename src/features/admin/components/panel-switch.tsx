/** An on/off switch of the panel (a plan's function, a campaign). `busy` while its change is being saved. */
export function PanelSwitch({
  on,
  label,
  disabled = false,
  busy = false,
  onChange,
}: {
  on: boolean
  label: string
  disabled?: boolean
  busy?: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled || busy}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
        busy ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'
      } ${on ? 'border-ember bg-ember' : 'border-line-2 bg-secondary'}`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-background shadow-sm transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
