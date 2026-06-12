'use client'

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { MonthlyDue, RamoSlice } from '../lib/portal-stats'
import { formatCurrency } from '../lib/portal-ui'

// ─── Ramo distribution donut ─────────────────────────────

export function RamoDonut({ data }: { data: RamoSlice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (total === 0) {
    return <div className="flex h-[180px] items-center justify-center text-[13px] text-faint">Sin datos</div>
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
            >
              {data.map(slice => (
                <Cell key={slice.ramo} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => {
                const n = Number(value)
                return [`${n} ${n === 1 ? 'póliza' : 'pólizas'}`, name]
              }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(15,13,10,0.12)',
                fontSize: 12,
                padding: '6px 10px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] leading-none text-ink">{total}</span>
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-faint">pólizas</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {data.map(slice => (
          <li key={slice.ramo} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="flex-1 text-[13px] text-ink-3">{slice.label}</span>
            <span className="text-[13px] font-semibold text-ink">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Upcoming due amounts bar chart ──────────────────────

export function VencimientosBar({ data }: { data: MonthlyDue[] }) {
  const hasData = data.some(d => d.total > 0)

  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center text-[13px] text-faint">
        No hay vencimientos próximos
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8f897b' }} dy={4} />
          <Tooltip
            cursor={{ fill: 'rgba(15,13,10,0.04)' }}
            formatter={value => [formatCurrency(Number(value)), 'A pagar']}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(15,13,10,0.12)',
              fontSize: 12,
              padding: '6px 10px',
            }}
          />
          <Bar dataKey="total" fill="#e8a820" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
