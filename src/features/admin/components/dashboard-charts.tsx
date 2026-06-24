'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { formatCurrency } from '@/src/features/admin/lib/asegurados-ui'
import type { DashboardData, RenovacionPoint } from '@/src/types/api/dashboard'

// Brand-aligned, semantically intuitive palette: green = healthy, amber = warning, red = problem.
const COLORS = {
  ember: '#e8a820',
  emerald: '#10b981',
  amber: '#f5c060',
  red: '#ef4444',
  sky: '#3b82f6',
  slate: '#94a3b8',
} as const

interface Slice {
  name: string
  value: number
  color: string
}

interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
  payload?: { color?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  suffix?: string
}

function ChartTooltip({ active, payload, label, suffix }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line-2 bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-md">
      {label ? <div className="mb-1 font-medium text-ink">{label}</div> : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ background: entry.color ?? entry.payload?.color ?? COLORS.ember }}
          />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="ml-auto font-medium text-ink">
            {entry.value}
            {suffix ?? ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function RenovacionesTooltip({ active, payload }: { active?: boolean; payload?: { payload: RenovacionPoint }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-line-2 bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-md">
      <div className="mb-1 font-medium text-ink">{point.label}</div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">Pólizas</span>
        <span className="ml-auto font-medium text-ink">{point.total}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">Prima</span>
        <span className="ml-auto font-medium text-ink">{formatCurrency(point.prima)}</span>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[15px] text-ink">{title}</CardTitle>
        {subtitle ? <p className="text-[12.5px] text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-center text-[13px] text-muted-foreground">
      {message}
    </div>
  )
}

function Breakdown({ data, unit, empty }: { data: Slice[]; unit: string; empty: string }) {
  const total = data.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return <EmptyChart message={empty} />

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[34px] leading-none text-ink">{total.toLocaleString('es-AR')}</span>
        <span className="text-[13px] text-muted-foreground">{unit} en total</span>
      </div>

      <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-secondary">
        {data.map(slice =>
          slice.value > 0 ? (
            <span
              key={slice.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(slice.value / total) * 100}%`, background: slice.color }}
            />
          ) : null,
        )}
      </div>

      <ul className="mt-5 grid gap-3">
        {data.map(slice => {
          const pct = Math.round((slice.value / total) * 100)
          return (
            <li key={slice.name} className="flex items-center gap-2.5 text-[13px]">
              <span className="inline-block size-2.5 rounded-full" style={{ background: slice.color }} />
              <span className="text-muted-foreground">{slice.name}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{pct}%</span>
              <span className="w-12 text-right font-medium tabular-nums text-ink">
                {slice.value.toLocaleString('es-AR')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Bars({ data, empty }: { data: Slice[]; empty: string }) {
  const total = data.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return <EmptyChart message={empty} />

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={36}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        />
        <Tooltip cursor={{ fill: 'var(--color-amber-subtle)' }} content={<ChartTooltip />} />
        <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]} maxBarSize={64}>
          {data.map(slice => (
            <Cell key={slice.name} fill={slice.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  const cartera: Slice[] = [
    { name: 'Vigentes', value: data.cartera.vigentes, color: COLORS.emerald },
    { name: 'Por vencer', value: data.cartera.porVencer, color: COLORS.amber },
    { name: 'Vencidas', value: data.cartera.vencidas, color: COLORS.red },
  ]
  const estado: Slice[] = [
    { name: 'Nuevas', value: data.solicitudesPorEstado.nuevas, color: COLORS.ember },
    { name: 'Contactadas', value: data.solicitudesPorEstado.contactadas, color: COLORS.sky },
    { name: 'Cerradas', value: data.solicitudesPorEstado.cerradas, color: COLORS.slate },
  ]
  const cobranzas: Slice[] = [
    { name: 'Pendientes', value: data.cobranzas.pendientes, color: COLORS.amber },
    { name: 'Vencidas', value: data.cobranzas.vencidas, color: COLORS.red },
    { name: 'Rechazadas', value: data.cobranzas.rechazadas, color: COLORS.slate },
  ]
  const siniestros: Slice[] = [
    { name: 'Pendiente', value: data.siniestrosPorEstado.pendiente, color: COLORS.red },
    { name: 'En proceso', value: data.siniestrosPorEstado.enProceso, color: COLORS.sky },
    { name: 'Resuelto', value: data.siniestrosPorEstado.resuelto, color: COLORS.emerald },
  ]

  const { primaEnRiesgo, timeline } = data.renovaciones
  const renovacionesEmpty = timeline.every(p => p.total === 0)

  return (
    <div className="mt-5 grid gap-4">
      <ChartCard
        title="Próximas renovaciones"
        subtitle={`Pólizas que vencen · próximos 6 meses · prima en riesgo ${formatCurrency(primaEnRiesgo)}`}
      >
        {renovacionesEmpty ? (
          <EmptyChart message="No hay pólizas por vencer en los próximos 6 meses." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={timeline} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                />
                <Tooltip cursor={{ fill: 'var(--color-amber-subtle)' }} content={<RenovacionesTooltip />} />
                <Bar dataKey="total" name="Pólizas" radius={[6, 6, 0, 0]} maxBarSize={72}>
                  {timeline.map((point, i) => (
                    // The current month is the most urgent renewal window — flag it red.
                    <Cell key={point.month} fill={i === 0 ? COLORS.red : COLORS.ember} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full" style={{ background: COLORS.red }} />
                Este mes (urgente)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-full" style={{ background: COLORS.ember }} />
                Próximos meses
              </span>
            </div>
          </>
        )}
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Cartera de clientes" subtitle="Estado de las pólizas vigentes">
          <Breakdown data={cartera} unit="pólizas" empty="Aún no hay pólizas cargadas." />
        </ChartCard>
        <ChartCard title="Solicitudes por estado" subtitle="Seguimiento comercial">
          <Breakdown data={estado} unit="solicitudes" empty="Aún no hay solicitudes." />
        </ChartCard>
        <ChartCard title="Cobranzas" subtitle="Cuotas impagas por estado">
          <Bars data={cobranzas} empty="No hay cuotas impagas. 🎉" />
        </ChartCard>
        <ChartCard title="Siniestros" subtitle="Distribución por estado">
          <Bars data={siniestros} empty="No hay siniestros registrados." />
        </ChartCard>
      </div>
    </div>
  )
}
