'use client'

import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'

export const int = (n: number) => n.toLocaleString('es-AR')
export const usd = (n: number) =>
  `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

/** The running month, "YYYY-MM". */
export const thisMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** The class of a table header cell in Facturación. */
export const HEAD = 'text-[11px] uppercase tracking-[0.12em] text-faint'

export function MonthPicker({
  value,
  onChange,
  id = 'billing-period',
}: {
  value: string
  onChange: (period: string) => void
  id?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>Mes</Label>
      <Input
        id={id}
        type="month"
        value={value}
        max={thisMonth()}
        onChange={event => {
          if (event.target.value) onChange(event.target.value)
        }}
        className="mt-1 w-48"
      />
    </div>
  )
}

export function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone?: 'good' | 'bad'
}) {
  const color =
    tone === 'good' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'bad' ? 'text-destructive' : 'text-ink'
  return (
    <Card className="flex flex-col gap-1 border-line-2 p-4 shadow-sm">
      <span className="text-[11px] uppercase tracking-[0.12em] text-faint">{label}</span>
      <span className={`font-display text-[24px] tracking-[-0.02em] ${color}`}>{value}</span>
      <span className="text-[12px] text-muted-foreground">{hint}</span>
    </Card>
  )
}
