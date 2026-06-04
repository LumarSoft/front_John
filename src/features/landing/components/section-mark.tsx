interface SectionMarkProps {
  index: string
  label: string
  tone?: 'light' | 'dark'
}

export function SectionMark({ index, label, tone = 'light' }: SectionMarkProps) {
  const indexColor = 'text-ember'
  const lineColor = tone === 'dark' ? 'bg-ember/55' : 'bg-ember/65'
  const labelColor = tone === 'dark' ? 'text-paper/65' : 'text-ink-3'

  return (
    <div className="flex items-center gap-3">
      <span className={`font-display text-[12px] font-bold leading-none tracking-[-0.02em] ${indexColor}`}>
        {index}
      </span>
      <span className={`block h-[1px] w-8 ${lineColor}`} aria-hidden />
      <span className={`text-[10.5px] font-semibold uppercase tracking-[0.24em] ${labelColor}`}>{label}</span>
    </div>
  )
}
