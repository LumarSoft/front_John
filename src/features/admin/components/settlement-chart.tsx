'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SettlementSeriesMonth } from '@/src/types/api/billing'
import { shortMonthLabel } from '../lib/settlement-format'
import { usd } from './billing-ui'

/** What each month's billing splits into: the bars stack up to what was billed. */
const SERIES = [
  { key: 'serviceCostUsd', name: 'Costo de servicio', color: 'var(--color-chart-1)' },
  { key: 'ownerShareUsd', name: 'Parte plataforma', color: 'var(--color-chart-3)' },
  { key: 'partnerShareUsd', name: 'Socio comercial', color: '#10b981' },
] as const

interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

function SettlementTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line-2 bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-md">
      {label ? <div className="mb-1 font-medium text-ink">{label}</div> : null}
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto pl-3 font-medium text-ink">{usd(Number(entry.value ?? 0))}</span>
        </div>
      ))}
    </div>
  )
}

export function SettlementChart({ months }: { months: SettlementSeriesMonth[] }) {
  const data = months.map(m => ({ ...m, label: shortMonthLabel(m.period) }))
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} stackOffset="sign" margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          />
          <Tooltip cursor={{ fill: 'var(--color-ember-soft)' }} content={<SettlementTooltip />} />
          {SERIES.map((serie, i) => (
            <Bar
              key={serie.key}
              dataKey={serie.key}
              name={serie.name}
              stackId="billed"
              fill={serie.color}
              maxBarSize={48}
              radius={i === SERIES.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
        {SERIES.map(serie => (
          <span key={serie.key} className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full" style={{ background: serie.color }} />
            {serie.name}
          </span>
        ))}
        <span>Las tres suman lo facturado.</span>
      </div>
    </div>
  )
}
