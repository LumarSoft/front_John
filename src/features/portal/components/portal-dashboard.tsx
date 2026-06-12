'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  PiggyBank,
  ShieldCheck,
  Wallet,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { usePolizas } from '../hooks/use-portal-data'
import { computePortalStats } from '../lib/portal-stats'
import { formatCurrency, formatDateLong, isBien, polizaSubject } from '../lib/portal-ui'
import { RamoDonut, VencimientosBar } from './dashboard-charts'
import { BienCard } from './bien-card'

// ─── Stat card ───────────────────────────────────────────

type Tone = 'neutral' | 'emerald' | 'amber' | 'destructive'

const TONE: Record<Tone, string> = {
  neutral: 'bg-ember-soft text-ember-2',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-700',
  destructive: 'bg-red-50 text-red-600',
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone: Tone
}) {
  return (
    <Card className="flex flex-row items-center gap-3 border-line-2 p-3.5 shadow-sm">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONE[tone]}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[22px] leading-none tracking-tight text-ink">{value}</div>
        <div className="mt-1 truncate text-[11.5px] text-faint">{label}</div>
        {hint ? <div className="truncate text-[10.5px] text-faint-2">{hint}</div> : null}
      </div>
    </Card>
  )
}

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
}

export function PortalDashboard() {
  const { data: polizas, isLoading, isError, error } = usePolizas()
  const stats = useMemo(() => (polizas ? computePortalStats(polizas) : null), [polizas])

  if (isLoading || !stats) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="mb-2 h-7 w-56" />
        <Skeleton className="mb-8 h-4 w-72" />
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-[260px] rounded-2xl" />
          <Skeleton className="h-[260px] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-faint-2" />
        <p className="text-[14px] text-faint">{error instanceof Error ? error.message : 'Error al cargar'}</p>
      </div>
    )
  }

  const bienes = (polizas ?? []).filter(isBien)
  const hasDebt = stats.deudaTotal > 0

  return (
    <div className="p-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Resumen</div>
        <h1 className="mt-1 font-display text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.03em] text-ink">
          Mi tablero
        </h1>
        <p className="mt-1 text-[13.5px] text-faint">Tu cartera asegurada de un vistazo.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <motion.div variants={fade}>
          <StatCard icon={Layers} label="Bienes asegurados" value={stats.bienesCount} tone="neutral" />
        </motion.div>
        <motion.div variants={fade}>
          <StatCard icon={ShieldCheck} label="Pólizas vigentes" value={stats.vigentes} tone="emerald" />
        </motion.div>
        <motion.div variants={fade}>
          <StatCard
            icon={AlertTriangle}
            label="Por vencer"
            hint="Próximos 30 días"
            value={stats.porVencer}
            tone="amber"
          />
        </motion.div>
        <motion.div variants={fade}>
          <StatCard
            icon={Wallet}
            label="Cuotas adeudadas"
            hint={stats.cuotasVencidas > 0 ? `${stats.cuotasVencidas} vencidas` : undefined}
            value={stats.cuotasPendientes + stats.cuotasVencidas}
            tone={stats.cuotasVencidas > 0 ? 'destructive' : 'amber'}
          />
        </motion.div>
        <motion.div variants={fade}>
          <StatCard
            icon={PiggyBank}
            label="Saldo a pagar"
            value={hasDebt ? formatCurrency(stats.deudaTotal) : 'Al día'}
            tone={hasDebt ? 'destructive' : 'emerald'}
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="border-line-2 p-5 shadow-sm">
          <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">Distribución por ramo</h2>
          <p className="mb-4 text-[12.5px] text-faint">Cómo se reparten tus pólizas.</p>
          <RamoDonut data={stats.ramos} />
        </Card>

        <Card className="border-line-2 p-5 shadow-sm">
          <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">Próximos pagos</h2>
          <p className="mb-2 text-[12.5px] text-faint">Cuotas a vencer por mes (próximos 6 meses).</p>
          <VencimientosBar data={stats.monthlyDue} />
        </Card>
      </div>

      {/* Próximos vencimientos */}
      <Card className="mt-5 border-line-2 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="size-4 text-ember-2" />
          <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">Próximos vencimientos</h2>
        </div>
        {stats.proximosVencimientos.length === 0 ? (
          <p className="py-2 text-[13px] text-faint">No tenés cuotas pendientes. ¡Estás al día! 🎉</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {stats.proximosVencimientos.map(({ poliza, cuota }) => (
              <li key={`${poliza.id}-${cuota.id}`}>
                <Link
                  href={`/portal/polizas/${poliza.id}`}
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-canvas-2/40"
                >
                  <span
                    className={[
                      'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      cuota.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700',
                    ].join(' ')}
                  >
                    {cuota.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{polizaSubject(poliza)}</p>
                    <p className="text-[11.5px] text-faint">
                      Cuota {cuota.numeroCuota} · vence {formatDateLong(cuota.dueDate)}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-[14px] font-semibold text-ink">
                    {formatCurrency(cuota.amount)}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-faint-2 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Mis bienes */}
      <div className="mt-8 mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.025em] text-ink">Mis bienes asegurados</h2>
          <p className="mt-0.5 text-[13px] text-faint">
            {bienes.length === 0
              ? 'No tenés bienes asegurados'
              : `${bienes.length} ${bienes.length === 1 ? 'bien' : 'bienes'}`}
          </p>
        </div>
        <Link href="/portal/polizas" className="text-[13px] font-medium text-ember-2 hover:underline">
          Ver todas →
        </Link>
      </div>

      {bienes.length === 0 ? (
        <Card className="border-dashed border-line-2 p-12 text-center">
          <p className="text-[14px] text-faint">Todavía no tenés bienes asegurados registrados.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {bienes.map(p => (
            <BienCard key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}
