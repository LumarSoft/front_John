'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Car,
  Home,
  Heart,
  Briefcase,
  Shield,
  AlertCircle,
  Loader2,
  CalendarDays,
  CreditCard,
  Hash,
  MapPin,
} from 'lucide-react'
import { fetchPoliza, type PolizaDetail, type RiskType } from '@/src/services/polizas.service'

// ─── Helpers ────────────────────────────────────────────

const RISK_LABELS: Record<RiskType, string> = {
  auto: 'Automotor',
  home: 'Hogar',
  life: 'Vida / Sepelio',
  commercial: 'Comercio',
  other: 'Otro',
}

const RISK_ICONS: Record<RiskType, React.ElementType> = {
  auto: Car,
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

const CUOTA_STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  paid: { label: 'Pagada', classes: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pendiente', classes: 'bg-canvas-2 text-faint border-line-2' },
  overdue: { label: 'Vencida', classes: 'bg-red-50 text-red-600 border-red-200' },
}

// ─── Info row ────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-[120px] text-[12.5px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[13.5px] text-ink">{value}</span>
    </div>
  )
}

// ─── Detail view ─────────────────────────────────────────

export function PolizaDetailView({ id }: { id: number }) {
  const [poliza, setPoliza] = useState<PolizaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPoliza(id)
      .then(setPoliza)
      .catch(e => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !poliza) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-[14px] text-muted-foreground">{error ?? 'Póliza no encontrada'}</p>
        <Link href="/portal/dashboard" className="text-[13px] text-ember hover:underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const Icon = RISK_ICONS[poliza.riskType]
  const v = poliza.vehiculo
  const vigente = poliza.status.toUpperCase().includes('VIGENTE')

  return (
    <div className="p-6 md:p-8">
      {/* Back link */}
      <Link
        href="/portal/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mis bienes
      </Link>

      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-line-2 bg-paper p-5 shadow-[0_2px_12px_-4px_rgba(15,13,10,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canvas-2">
              <Icon className="h-6 w-6 text-ink-3" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[20px] font-semibold tracking-[-0.025em] text-ink">
                  {v ? [v.marca, v.modelo].filter(Boolean).join(' ') || 'Automotor' : RISK_LABELS[poliza.riskType]}
                </h1>
                {v?.anio && <span className="font-display text-[16px] font-normal text-faint">{v.anio}</span>}
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-[2px] text-[10.5px] font-semibold uppercase tracking-wide border',
                    vigente ? 'bg-ember-soft text-ember-2 border-ember-ring' : 'bg-canvas-2 text-faint border-line-2',
                  ].join(' ')}
                >
                  {poliza.status}
                </span>
              </div>
              {v?.dominio && (
                <span className="mt-1.5 inline-flex items-center rounded-md border border-line-2 bg-canvas px-2.5 py-0.5 font-display text-[12.5px] font-semibold tracking-[0.12em] text-ink">
                  {v.dominio}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-[12px] text-muted-foreground">
            <p className="uppercase tracking-wider">Certificado</p>
            <p className="font-display text-[14px] font-medium text-ink-3">{poliza.certificado}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Coverage info */}
        <div className="rounded-2xl border border-line-2 bg-paper p-5">
          <h2 className="mb-1 font-display text-[13.5px] font-semibold tracking-[-0.01em] text-ink">Cobertura</h2>
          <div className="divide-y divide-line">
            <InfoRow icon={CalendarDays} label="Vigencia desde" value={formatDate(poliza.vigenciaDesde)} />
            <InfoRow icon={CalendarDays} label="Vigencia hasta" value={formatDate(poliza.vigenciaHasta)} />
            <InfoRow icon={CreditCard} label="Premio mensual" value={formatCurrency(poliza.premio)} />
            {poliza.paymentMethod && <InfoRow icon={CreditCard} label="Forma de pago" value={poliza.paymentMethod} />}
            <InfoRow
              icon={Shield}
              label="Compañía"
              value={poliza.company.charAt(0).toUpperCase() + poliza.company.slice(1)}
            />
          </div>
        </div>

        {/* Vehicle / risk details */}
        {v && (
          <div className="rounded-2xl border border-line-2 bg-paper p-5">
            <h2 className="mb-1 font-display text-[13.5px] font-semibold tracking-[-0.01em] text-ink">Vehículo</h2>
            <div className="divide-y divide-line">
              {v.tipo && <InfoRow icon={Car} label="Tipo" value={v.tipo} />}
              {v.uso && <InfoRow icon={MapPin} label="Uso" value={v.uso} />}
              {v.cobertura && <InfoRow icon={Shield} label="Cobertura" value={v.cobertura} />}
              {v.sumaAsegurada && (
                <InfoRow icon={Hash} label="Suma asegurada" value={formatCurrency(v.sumaAsegurada)} />
              )}
              {v.chasis && <InfoRow icon={Hash} label="Chasis" value={v.chasis as string} />}
              {v.ceroKm && <InfoRow icon={Car} label="Cero km" value="Sí" />}
            </div>
          </div>
        )}
      </div>

      {/* Cuotas */}
      {poliza.cuotas.length > 0 && (
        <div className="mt-5 rounded-2xl border border-line-2 bg-paper p-5">
          <h2 className="mb-4 font-display text-[13.5px] font-semibold tracking-[-0.01em] text-ink">Cuotas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    N°
                  </th>
                  <th className="pb-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Vencimiento
                  </th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Importe
                  </th>
                  <th className="pb-2 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {poliza.cuotas.map(c => {
                  const st = CUOTA_STATUS_LABELS[c.status] ?? CUOTA_STATUS_LABELS.pending
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 text-ink-3">{c.numeroCuota}</td>
                      <td className="py-2.5 text-ink-3">{formatDate(c.dueDate)}</td>
                      <td className="py-2.5 text-right font-medium text-ink">{formatCurrency(c.amount)}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[10.5px] font-semibold ${st.classes}`}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
