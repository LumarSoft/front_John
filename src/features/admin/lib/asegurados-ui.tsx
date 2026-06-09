import { Car, Home, LifeBuoy, Shield, Store } from 'lucide-react'
import type { AdminPolizaSummary, RiskType } from '@/src/types/api/clients'

export const RISK_LABELS: Record<RiskType, string> = {
  auto: 'Automotor',
  home: 'Hogar',
  life: 'Vida',
  commercial: 'Comercial',
  other: 'Otro',
}

export function RiskIcon({ type, className }: { type: RiskType; className?: string }) {
  const props = { className: className ?? 'size-4' }
  switch (type) {
    case 'auto':
      return <Car {...props} />
    case 'home':
      return <Home {...props} />
    case 'life':
      return <LifeBuoy {...props} />
    case 'commercial':
      return <Store {...props} />
    default:
      return <Shield {...props} />
  }
}

export type PolizaEstado = 'vigente' | 'expiring' | 'vencida'

export interface PolizaStatus {
  label: string
  estado: PolizaEstado
  daysLeft: number | null
}

const EXPIRING_WINDOW_DAYS = 30

export function polizaStatus(vigenciaHasta: string | null | undefined): PolizaStatus {
  const now = new Date()
  const expiry = vigenciaHasta ? new Date(vigenciaHasta) : null
  if (!expiry || expiry < now) return { label: 'Vencida', estado: 'vencida', daysLeft: null }
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86_400_000)
  if (daysLeft <= EXPIRING_WINDOW_DAYS) return { label: `Vence en ${daysLeft}d`, estado: 'expiring', daysLeft }
  return { label: 'Vigente', estado: 'vigente', daysLeft }
}

export function nearestExpiry(vigenciaHastaList: (string | null)[]): { date: Date; daysLeft: number } | null {
  const now = new Date()
  const future = vigenciaHastaList
    .filter((d): d is string => !!d && new Date(d) >= now)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime())

  if (!future.length) return null
  const date = future[0]
  return { date, daysLeft: Math.ceil((date.getTime() - now.getTime()) / 86_400_000) }
}

export type ClientStatusKey = 'vigente' | 'expiring' | 'vencida' | 'none'

export interface ClientStatusStyle {
  key: ClientStatusKey
  label: string
  dot: string
}

const CLIENT_STATUS_STYLES: Record<ClientStatusKey, ClientStatusStyle> = {
  vigente: { key: 'vigente', label: 'Al día', dot: 'bg-emerald-500' },
  expiring: { key: 'expiring', label: 'Por vencer', dot: 'bg-amber-2' },
  vencida: { key: 'vencida', label: 'Sin vigentes', dot: 'bg-destructive' },
  none: { key: 'none', label: 'Sin pólizas', dot: 'bg-faint-2' },
}

/** Overall health of a client, derived from the best status across all their policies. */
export function clientStatus(polizas: { vigenciaHasta: string | null }[]): ClientStatusStyle {
  if (polizas.length === 0) return CLIENT_STATUS_STYLES.none
  let best: ClientStatusKey = 'vencida'
  for (const p of polizas) {
    const estado = polizaStatus(p.vigenciaHasta).estado
    if (estado === 'vigente') return CLIENT_STATUS_STYLES.vigente
    if (estado === 'expiring') best = 'expiring'
  }
  return CLIENT_STATUS_STYLES[best]
}

/** Distinct risk types in the order they should be shown, plus per-client counts. */
export function ramoSummary(polizas: AdminPolizaSummary[]): {
  ramos: RiskType[]
  dominio: string | null
  vigentes: number
} {
  const ramos: RiskType[] = []
  for (const p of polizas) {
    if (!ramos.includes(p.riskType)) ramos.push(p.riskType)
  }
  const dominio = polizas.find(p => p.vehiculo?.dominio)?.vehiculo?.dominio ?? null
  const now = new Date()
  const vigentes = polizas.filter(p => p.vigenciaHasta && new Date(p.vigenciaHasta) >= now).length
  return { ramos, dominio, vigentes }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function relativeDays(daysLeft: number): string {
  if (daysLeft <= 0) return 'hoy'
  if (daysLeft === 1) return 'mañana'
  if (daysLeft < 30) return `en ${daysLeft} días`
  const months = Math.round(daysLeft / 30)
  return months <= 1 ? 'en 1 mes' : `en ${months} meses`
}

export function formatCurrency(amount: string | null | undefined): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(parseFloat(amount))
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}
