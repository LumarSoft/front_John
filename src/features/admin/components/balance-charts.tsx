'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import type { BalanceMetricKey, BalanceMonth } from '@/src/types/api/balance'
import { formatBalanceValue, BALANCE_METRIC_INFO, shortPeriodLabel, periodLabel } from '../lib/balance-format'

// Same palette as the dashboard: green = healthy, red = problem, ember = the organization's accent.
const COLORS = {
  ember: 'var(--color-ember)',
  emerald: '#10b981',
  amber: '#f5c060',
  red: '#ef4444',
  sky: '#3b82f6',
  slate: '#94a3b8',
} as const

interface Series {
  key: BalanceMetricKey
  name: string
  color: string
}

type ChartPoint = { period: string; label: string } & Partial<Record<BalanceMetricKey, number | null>>

function toPoints(months: BalanceMonth[], series: Series[]): ChartPoint[] {
  return months.map(month => ({
    period: month.period,
    label: shortPeriodLabel(month.period),
    ...Object.fromEntries(series.map(s => [s.key, month.metrics[s.key]?.value ?? null])),
  }))
}

interface TooltipEntry {
  dataKey?: string | number
  name?: string
  value?: number | string | null
  color?: string
  payload?: ChartPoint
}

function BalanceTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-line-2 bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-md">
      {point ? <div className="mb-1 font-medium text-ink">{periodLabel(point.period)}</div> : null}
      {payload.map(entry => {
        const info = BALANCE_METRIC_INFO.find(i => i.key === entry.dataKey)
        const value = typeof entry.value === 'number' ? entry.value : null
        return (
          <div key={String(entry.dataKey)} className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-3 font-medium text-ink">
              {info ? formatBalanceValue(info, value) : (value ?? 'sin dato')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[15px] text-ink">{title}</CardTitle>
        <p className="text-[12.5px] text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const axisTick = { fontSize: 12, fill: 'var(--color-muted-foreground)' }

function Legend({ series }: { series: Series[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
      {series.map(s => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  )
}

const compact = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 })
/** Axis ticks: plain counts, big amounts shortened ("1,9 M"). */
const axisNumber = (v: number) => (Math.abs(v) >= 100_000 ? compact.format(v) : v.toLocaleString('es-AR'))

function EvolutionLine({ months, series }: { months: BalanceMonth[]; series: Series[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={toPoints(months, series)} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
          {/* Fitted to the values, not from 0, so a month's growth shows. */}
          <YAxis
            domain={['auto', 'auto']}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={axisTick}
            tickFormatter={axisNumber}
          />
          <Tooltip content={<BalanceTooltip />} />
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              // A month without data stays a gap: joining it would invent a value.
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {series.length > 1 && <Legend series={series} />}
    </>
  )
}

function EvolutionBars({ months, series }: { months: BalanceMonth[]; series: Series[] }) {
  return (
    <>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={toPoints(months, series)} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={44} tick={axisTick} />
          <Tooltip cursor={{ fill: 'var(--color-ember-soft)' }} content={<BalanceTooltip />} />
          {series.map(s => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <Legend series={series} />
    </>
  )
}

/** How the organization moved month to month. Months without data show as gaps. */
export function BalanceCharts({ months }: { months: BalanceMonth[] }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <ChartCard title="Pólizas vigentes" subtitle="Cuántas pólizas quedaron vigentes al cierre de cada mes">
        <EvolutionLine months={months} series={[{ key: 'policiesInForce', name: 'Vigentes', color: COLORS.ember }]} />
      </ChartCard>
      <ChartCard title="Nuevas y vencidas sin renovar" subtitle="Lo que entra contra lo que se pierde">
        <EvolutionBars
          months={months}
          series={[
            { key: 'policiesNew', name: 'Nuevas', color: COLORS.emerald },
            { key: 'policiesLost', name: 'Vencidas sin renovar', color: COLORS.red },
          ]}
        />
      </ChartCard>
      <ChartCard title="De la cotización al cierre" subtitle="Cotizaciones, pedidos y solicitudes cerradas">
        <EvolutionBars
          months={months}
          series={[
            { key: 'quotes', name: 'Cotizaciones', color: COLORS.ember },
            { key: 'quoteRequests', name: 'Pedidos de cobertura', color: COLORS.sky },
            { key: 'requestsClosed', name: 'Cerradas', color: COLORS.emerald },
          ]}
        />
      </ChartCard>
      <ChartCard title="Siniestros" subtitle="Denuncias recibidas y las que el bot frenó">
        <EvolutionBars
          months={months}
          series={[
            { key: 'claimsFiled', name: 'Recibidas', color: COLORS.sky },
            { key: 'claimsBlocked', name: 'Frenadas', color: COLORS.amber },
          ]}
        />
      </ChartCard>
      <ChartCard title="Deuda por cobrar" subtitle="Cuotas impagas al cierre de cada mes">
        <EvolutionLine months={months} series={[{ key: 'debtAmount', name: 'Deuda', color: COLORS.red }]} />
      </ChartCard>
      <ChartCard title="Atención" subtitle="Chats nuevos y pedidos de un asesor">
        <EvolutionBars
          months={months}
          series={[
            { key: 'conversationsNew', name: 'Chats nuevos', color: COLORS.slate },
            { key: 'handoffs', name: 'Pedidos de un asesor', color: COLORS.ember },
          ]}
        />
      </ChartCard>
    </div>
  )
}
