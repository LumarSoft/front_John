'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ShieldAlert, ShieldCheck, Users, Wallet } from 'lucide-react'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import type { AdminClientsStats, ClientEstadoFilter } from '@/src/types/api/clients'
import { useAdminClientsStats } from '../hooks/use-admin-clients-stats'

interface StatDef {
  key: string
  label: string
  value: number
  icon: LucideIcon
  tone: 'neutral' | 'emerald' | 'amber' | 'destructive'
  estado?: ClientEstadoFilter
}

const TONE_STYLES: Record<StatDef['tone'], { icon: string; ring: string }> = {
  neutral: { icon: 'bg-ember-soft text-ember-2', ring: 'hover:border-ember-2/40' },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    ring: 'hover:border-emerald-500/40',
  },
  amber: { icon: 'bg-amber/15 text-amber-700 dark:text-amber', ring: 'hover:border-amber/50' },
  destructive: { icon: 'bg-destructive/10 text-destructive', ring: 'hover:border-destructive/40' },
}

function buildStats(data: AdminClientsStats): StatDef[] {
  return [
    { key: 'total', label: 'Asegurados', value: data.totalClients, icon: Users, tone: 'neutral' },
    {
      key: 'vigentes',
      label: 'Pólizas vigentes',
      value: data.vigentes,
      icon: ShieldCheck,
      tone: 'emerald',
      estado: 'vigente',
    },
    {
      key: 'porVencer',
      label: 'Por vencer (30d)',
      value: data.porVencer,
      icon: AlertTriangle,
      tone: 'amber',
      estado: 'por_vencer',
    },
    {
      key: 'vencidas',
      label: 'Pólizas vencidas',
      value: data.vencidas,
      icon: ShieldAlert,
      tone: 'destructive',
      estado: 'vencida',
    },
    { key: 'cuotas', label: 'Cuotas vencidas', value: data.cuotasVencidas, icon: Wallet, tone: 'destructive' },
  ]
}

interface AseguradosStatsProps {
  activeEstado?: ClientEstadoFilter
  onSelectEstado: (estado?: ClientEstadoFilter) => void
}

export function AseguradosStats({ activeEstado, onSelectEstado }: AseguradosStatsProps) {
  const { data, isLoading } = useAdminClientsStats()

  if (isLoading || !data) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[78px] rounded-xl" />
        ))}
      </div>
    )
  }

  const stats = buildStats(data)

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map(stat => {
        const Icon = stat.icon
        const tone = TONE_STYLES[stat.tone]
        const clickable = !!stat.estado
        const active = stat.estado && stat.estado === activeEstado

        return (
          <Card
            key={stat.key}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onSelectEstado(active ? undefined : stat.estado) : undefined}
            onKeyDown={
              clickable
                ? e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectEstado(active ? undefined : stat.estado)
                    }
                  }
                : undefined
            }
            className={`flex flex-row items-center gap-3 border-line-2 p-3.5 shadow-sm transition-colors ${
              clickable ? `cursor-pointer ${tone.ring}` : ''
            } ${active ? 'border-ember-2/60 bg-ember-soft/40 ring-1 ring-ember-2/30' : ''}`}
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
              <Icon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[22px] leading-none tracking-tight text-ink">{stat.value}</div>
              <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{stat.label}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
