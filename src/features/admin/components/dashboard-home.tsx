'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, ShieldAlert, Users, Wallet, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { formatCurrency } from '@/src/features/admin/lib/asegurados-ui'
import { useDashboard } from '../hooks/use-dashboard'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import type { DashboardData } from '@/src/types/api/dashboard'

// Recharts is heavy and never needed on first paint — load it lazily.
const DashboardCharts = dynamic(() => import('./dashboard-charts').then(m => m.DashboardCharts), {
  ssr: false,
  loading: () => <ChartsSkeleton />,
})

type KpiTone = 'ember' | 'emerald' | 'red' | 'amber'

interface Kpi {
  key: string
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: KpiTone
}

const TONES: Record<KpiTone, string> = {
  ember: 'border-amber-border bg-ember-soft text-ember-2',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  amber: 'bg-amber/15 text-amber-700 dark:text-amber',
}

function buildKpis(data: DashboardData): Kpi[] {
  const { kpis } = data
  return [
    {
      key: 'asegurados',
      label: 'Asegurados',
      value: String(kpis.asegurados),
      hint: 'Clientes activos',
      icon: Users,
      tone: 'ember',
    },
    {
      key: 'solicitudes',
      label: 'Solicitudes nuevas',
      value: String(kpis.solicitudesNuevas),
      hint: 'Sin contactar todavía',
      icon: FileText,
      tone: 'emerald',
    },
    {
      key: 'deuda',
      label: 'Deuda por cobrar',
      value: formatCurrency(kpis.montoDeudaTotal),
      hint: `${kpis.cuotasVencidas} cuotas vencidas`,
      icon: Wallet,
      tone: 'red',
    },
    {
      key: 'siniestros',
      label: 'Siniestros abiertos',
      value: String(kpis.siniestrosAbiertos),
      hint: 'Pendientes o en proceso',
      icon: ShieldAlert,
      tone: 'amber',
    },
  ]
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  return (
    <Card className="border-line-2 p-4 shadow-sm">
      <span
        className={`flex size-10 items-center justify-center rounded-xl border border-transparent ${TONES[kpi.tone]}`}
      >
        <Icon className="size-5" />
      </span>
      <CardContent className="mt-3 p-0">
        <div className="font-display text-[28px] leading-none text-ink">{kpi.value}</div>
        <div className="mt-1.5 text-[13px] font-medium text-ink">{kpi.label}</div>
        <div className="text-[12px] text-muted-foreground">{kpi.hint}</div>
      </CardContent>
    </Card>
  )
}

function KpiRow({ data }: { data: DashboardData }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {buildKpis(data).map(kpi => (
        <KpiCard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  )
}

function ChartsSkeleton() {
  return (
    <div className="mt-5 grid gap-4">
      <Skeleton className="h-[360px] rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[320px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[122px] rounded-xl" />
        ))}
      </div>
      <ChartsSkeleton />
    </>
  )
}

export function DashboardHome() {
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const { data, isLoading, isError, refetch } = useDashboard(scope)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Dashboard</div>
          <h1 className="mt-2 font-display text-[clamp(28px,4vw,40px)] tracking-[-0.035em] text-ink">
            Hola de nuevo 👋
          </h1>
          <p className="mt-2 text-[14.5px] text-muted-foreground">
            Un resumen en vivo de tu operación: asegurados, solicitudes, cobranzas y siniestros.
          </p>
        </div>
        <ScopeFilter value={scope} onChange={setScope} />
      </motion.div>

      {isLoading ? <DashboardSkeleton /> : null}

      {isError ? (
        <Card className="mt-8 border-line-2 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-[20px] text-ink">No pudimos cargar las métricas</h2>
              <p className="mx-auto mt-1.5 max-w-[380px] text-[13.5px] text-muted-foreground">
                Revisá tu conexión e intentá de nuevo.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-amber-border bg-ember-soft px-4 py-2 text-[13px] font-medium text-ember-2 transition-colors hover:bg-amber-subtle"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      ) : null}

      {data ? (
        <>
          <KpiRow data={data} />
          <DashboardCharts data={data} />
        </>
      ) : null}
    </div>
  )
}
