'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Clock, CreditCard, Search, Shield, X } from 'lucide-react'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import type { Cuota, PolizaListItem, RiskType } from '@/src/services/polizas.service'
import { usePolizas } from '../hooks/use-portal-data'
import {
  effectiveRiskType,
  formatCurrency,
  formatDate,
  isVigente,
  polizaSubject,
  RISK_ICONS,
  RISK_LABELS,
} from '../lib/portal-ui'

type EstadoFilter = 'vigente' | 'por_vencer' | 'vencida'

const ESTADO_LABELS: Record<EstadoFilter, string> = {
  vigente: 'Vigentes',
  por_vencer: 'Por vencer',
  vencida: 'Vencidas',
}

const EXPIRING_DAYS = 30
const DAY_MS = 86_400_000

interface CuotaSummary {
  total: number
  paid: number
  pending: number
  overdue: number
  owed: number
  next: Cuota | null
}

function summarizeCuotas(cuotas: Cuota[]): CuotaSummary {
  let paid = 0
  let pending = 0
  let overdue = 0
  let owed = 0
  let next: Cuota | null = null
  for (const c of cuotas) {
    if (c.status === 'paid') paid++
    else {
      if (c.status === 'overdue') overdue++
      else pending++
      owed += parseFloat(c.amount) || 0
      if (!next) next = c
    }
  }
  return { total: cuotas.length, paid, pending, overdue, owed, next }
}

function matchesEstado(p: PolizaListItem, estado: EstadoFilter): boolean {
  const hasta = p.vigenciaHasta ? new Date(p.vigenciaHasta) : null
  const now = new Date()
  if (!hasta) return estado === 'vigente' && isVigente(p.status)
  if (estado === 'vencida') return hasta < now
  if (estado === 'vigente') return hasta >= now
  // por_vencer
  return hasta >= now && hasta <= new Date(now.getTime() + EXPIRING_DAYS * DAY_MS)
}

function matchesSearch(p: PolizaListItem, q: string): boolean {
  const haystack = [
    p.certificado,
    polizaSubject(p),
    p.vehiculo?.dominio,
    p.vehiculo?.marca,
    p.vehiculo?.modelo,
    p.vehiculo?.subModelo,
    RISK_LABELS[effectiveRiskType(p)],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q.toLowerCase())
}

// ─── Cuota summary strip ─────────────────────────────────

function CuotasStrip({ cuotas }: { cuotas: Cuota[] }) {
  const s = summarizeCuotas(cuotas)
  if (s.total === 0) return <span className="text-[12px] text-faint">Sin cuotas registradas</span>

  const pct = Math.round((s.paid / s.total) * 100)

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
        <span className="font-medium text-ink-3">
          {s.paid}/{s.total} cuotas pagadas
        </span>
        {s.owed > 0 ? (
          <span className={s.overdue > 0 ? 'font-semibold text-red-600' : 'font-semibold text-amber-700'}>
            Adeuda {formatCurrency(s.owed)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Al día
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-2">
        <div
          className={`h-full rounded-full ${s.overdue > 0 ? 'bg-red-400' : s.pending > 0 ? 'bg-amber-400' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {s.next ? (
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-faint">
          {s.next.status === 'overdue' ? (
            <Clock className="h-3.5 w-3.5 text-red-500" />
          ) : (
            <Calendar className="h-3.5 w-3.5" />
          )}
          Próxima: cuota {s.next.numeroCuota} · {formatDate(s.next.dueDate)} · {formatCurrency(s.next.amount)}
        </div>
      ) : null}
    </div>
  )
}

// ─── Policy row ──────────────────────────────────────────

function PolizaRow({ poliza }: { poliza: PolizaListItem }) {
  const ramo = effectiveRiskType(poliza)
  const Icon = RISK_ICONS[ramo]
  const v = poliza.vehiculo
  const vigente = isVigente(poliza.status)

  return (
    <Link
      href={`/portal/polizas/${poliza.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-2xl border border-line-2 bg-paper px-5 py-4 transition-shadow hover:shadow-[0_2px_12px_-4px_rgba(15,13,10,0.1)]"
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas-2">
        <Icon className="h-4 w-4 text-ink-3" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-display text-[14.5px] font-semibold text-ink">{polizaSubject(poliza)}</span>
          {v?.dominio ? (
            <span className="rounded border border-line-2 bg-canvas px-1.5 py-0.5 font-display text-[11px] font-bold tracking-widest text-ink">
              {v.dominio}
            </span>
          ) : null}
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide',
              vigente
                ? 'border border-ember-ring bg-ember-soft text-ember-2'
                : 'border border-line-2 bg-canvas-2 text-faint',
            ].join(' ')}
          >
            {poliza.status}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-faint">
          <span className="font-medium uppercase tracking-wide">{RISK_LABELS[ramo]}</span>
          <span className="text-line-2">·</span>
          <span>
            Póliza {poliza.certificado}
            {poliza.suplemento > 0 ? ` · Sup. ${poliza.suplemento}` : ''}
          </span>
          <span className="text-line-2">·</span>
          <span>Vence {formatDate(poliza.vigenciaHasta)}</span>
          {poliza.premio ? (
            <>
              <span className="text-line-2">·</span>
              <span className="inline-flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                {formatCurrency(poliza.premio)}/mes
              </span>
            </>
          ) : null}
        </div>

        <div className="mt-3 max-w-md">
          <CuotasStrip cuotas={poliza.cuotas} />
        </div>
      </div>

      <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-faint-2 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

// ─── List ────────────────────────────────────────────────

export function PolizasList() {
  const { data: polizas, isLoading, isError, error } = usePolizas()
  const [search, setSearch] = useState('')
  const [ramo, setRamo] = useState<RiskType | null>(null)
  const [estado, setEstado] = useState<EstadoFilter | null>(null)

  const ramosPresent = useMemo(() => {
    const set = new Set<RiskType>()
    for (const p of polizas ?? []) set.add(effectiveRiskType(p))
    return [...set]
  }, [polizas])

  const filtered = useMemo(() => {
    return (polizas ?? []).filter(p => {
      if (search && !matchesSearch(p, search)) return false
      if (ramo && effectiveRiskType(p) !== ramo) return false
      if (estado && !matchesEstado(p, estado)) return false
      return true
    })
  }, [polizas, search, ramo, estado])

  const hasFilters = !!search || !!ramo || !!estado

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <Skeleton className="mb-6 h-7 w-44" />
        <Skeleton className="mb-4 h-10 w-full max-w-md rounded-xl" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
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

  return (
    <div className="p-6 md:p-8">
      <div className="mb-5">
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.025em] text-ink">Mis pólizas</h1>
        <p className="mt-1 text-[13.5px] text-faint">
          {(polizas ?? []).length} {(polizas ?? []).length === 1 ? 'póliza' : 'pólizas'} · gestioná coberturas y cuotas
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-3 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint-2" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por patente, marca, certificado…"
          className="h-10 border-line-2 bg-paper pl-9 text-[13.5px]"
        />
        {search ? (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-faint-2 hover:text-ink"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {ramosPresent.map(r => {
          const Icon = RISK_ICONS[r]
          const active = ramo === r
          return (
            <button
              key={r}
              onClick={() => setRamo(active ? null : r)}
              className={[
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors',
                active
                  ? 'border-ember bg-ember-soft text-ember-2'
                  : 'border-line-2 bg-paper text-ink-3 hover:bg-canvas-2',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {RISK_LABELS[r]}
            </button>
          )
        })}
        <span className="mx-1 h-5 w-px bg-line-2" />
        {(Object.keys(ESTADO_LABELS) as EstadoFilter[]).map(e => {
          const active = estado === e
          return (
            <button
              key={e}
              onClick={() => setEstado(active ? null : e)}
              className={[
                'inline-flex h-8 items-center rounded-full border px-3 text-[12.5px] font-medium transition-colors',
                active
                  ? 'border-ember bg-ember-soft text-ember-2'
                  : 'border-line-2 bg-paper text-ink-3 hover:bg-canvas-2',
              ].join(' ')}
            >
              {ESTADO_LABELS[e]}
            </button>
          )
        })}
        {hasFilters ? (
          <button
            onClick={() => {
              setSearch('')
              setRamo(null)
              setEstado(null)
            }}
            className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium text-faint hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        ) : null}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-line-2 p-12 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-faint-2/50" />
          <p className="text-[14px] text-faint">
            {hasFilters ? 'No hay pólizas que coincidan con los filtros.' : 'Todavía no tenés pólizas registradas.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => (
            <PolizaRow key={p.id} poliza={p} />
          ))}
        </div>
      )}
    </div>
  )
}
