'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Car,
  Bike,
  Home,
  Heart,
  Briefcase,
  Shield,
  CreditCard,
  Calendar,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { fetchPolizas, proximaCuota, type PolizaListItem, type RiskType } from '@/src/services/polizas.service'

// ─── Helpers ────────────────────────────────────────────

const RISK_LABELS: Record<RiskType, string> = {
  auto: 'Automotor',
  moto: 'Moto',
  home: 'Hogar',
  life: 'Vida / Sepelio',
  commercial: 'Comercio',
  other: 'Otro',
}

const RISK_ICONS: Record<RiskType, React.ElementType> = {
  auto: Car,
  moto: Bike,
  home: Home,
  life: Heart,
  commercial: Briefcase,
  other: Shield,
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatCurrency(raw: string | null): string {
  if (!raw) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(parseFloat(raw))
}

function isVigente(status: string) {
  return status.toUpperCase().includes('VIGENTE')
}

// ─── Cuota status chip ────────────────────────────────────

function CuotaChip({ cuota }: { cuota: ReturnType<typeof proximaCuota> }) {
  if (!cuota) return <span className="text-[12px] text-faint">Sin cuotas</span>

  if (cuota.status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Cuota {cuota.numeroCuota} pagada
      </span>
    )
  }

  if (cuota.status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-red-500">
        <AlertTriangle className="h-3.5 w-3.5" />
        Cuota {cuota.numeroCuota} vencida — {formatCurrency(cuota.amount)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-faint">
      <Clock className="h-3.5 w-3.5" />
      Cuota {cuota.numeroCuota} — {formatDate(cuota.dueDate)} · {formatCurrency(cuota.amount)}
    </span>
  )
}

// ─── Policy row ──────────────────────────────────────────

function isMotoTipo(tipo: string | null | undefined): boolean {
  if (!tipo) return false
  const t = tipo.toUpperCase()
  return t.includes('MOTO') || t === 'MOTOCICLETA'
}

function PolizaRow({ poliza }: { poliza: PolizaListItem }) {
  // Derive icon from vehicle tipo when riskType may be stale in DB
  const effectiveRiskType: RiskType = poliza.vehiculo && isMotoTipo(poliza.vehiculo.tipo) ? 'moto' : poliza.riskType
  const Icon = RISK_ICONS[effectiveRiskType]
  const v = poliza.vehiculo
  const b = poliza.bien
  const vigente = isVigente(poliza.status)
  const proxima = proximaCuota(poliza.cuotas)

  // Title: vehicle name, bien description (stripping DNI suffix), or fallback
  let subject: string
  if (v) {
    subject = [v.marca, v.modelo].filter(Boolean).join(' ') || `Póliza ${poliza.certificado}`
  } else if (b?.descripcion) {
    subject = b.descripcion.split(' - DNI:')[0].trim()
  } else {
    subject = `Póliza ${poliza.certificado}`
  }

  return (
    <Link
      href={`/portal/polizas/${poliza.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-xl border border-line-2 bg-paper px-5 py-4 transition-shadow hover:shadow-[0_2px_12px_-4px_rgba(15,13,10,0.1)]"
    >
      {/* Icon */}
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas-2">
        <Icon className="h-4 w-4 text-ink-3" />
      </div>

      {/* Content */}
      <div className="min-w-0">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-[14.5px] font-semibold text-ink">{subject}</span>
          {v?.dominio && (
            <span className="rounded border border-line-2 bg-canvas px-1.5 py-0.5 font-display text-[11px] font-bold tracking-widest text-ink">
              {v.dominio}
            </span>
          )}
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide',
              vigente
                ? 'bg-ember-soft text-ember-2 border border-ember-ring'
                : 'bg-canvas-2 text-faint border border-line-2',
            ].join(' ')}
          >
            {poliza.status}
          </span>
        </div>

        {/* Type + certificado */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">{RISK_LABELS[effectiveRiskType]}</span>
          <span className="text-line-2">·</span>
          <span>
            Póliza {poliza.certificado}
            {poliza.suplemento > 0 ? ` · Sup. ${poliza.suplemento}` : ''}
          </span>
          <span className="text-line-2">·</span>
          <span>Vigente hasta {formatDate(poliza.vigenciaHasta)}</span>
        </div>

        {/* Financial row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {poliza.premio && (
            <span className="inline-flex items-center gap-1 text-[12px] text-faint">
              <CreditCard className="h-3.5 w-3.5" />
              {formatCurrency(poliza.premio)}/mes
              {poliza.paymentMethod ? ` · ${poliza.paymentMethod}` : ''}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[12px] text-faint">
            <Calendar className="h-3.5 w-3.5" />
            <CuotaChip cuota={proxima} />
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

// ─── List ─────────────────────────────────────────────────

export function PolizasList() {
  const [polizas, setPolizas] = useState<PolizaListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPolizas()
      .then(setPolizas)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-[14px] text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Mis pólizas</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {polizas.length === 0
            ? 'No tenés pólizas registradas'
            : `${polizas.length} ${polizas.length === 1 ? 'póliza' : 'pólizas'}`}
        </p>
      </div>

      {polizas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-2 p-12 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-[14px] text-muted-foreground">Todavía no tenés pólizas registradas en el sistema.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {polizas.map(p => (
            <PolizaRow key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}
