import { Car, Bike, Home, Heart, Briefcase, Shield } from 'lucide-react'
import type { PolizaListItem, RiskType } from '@/src/services/polizas.service'

export const RISK_ICONS: Record<RiskType, React.ElementType> = {
  auto: Car,
  moto: Bike,
  home: Home,
  life: Heart,
  commercial: Briefcase,
  other: Shield,
}

export const RISK_LABELS: Record<RiskType, string> = {
  auto: 'Automotor',
  moto: 'Moto',
  home: 'Hogar',
  life: 'Vida / Sepelio',
  commercial: 'Comercio',
  other: 'Otro',
}

// Color per ramo for charts (uses literal hex so Recharts can paint fills).
export const RISK_COLORS: Record<RiskType, string> = {
  auto: '#e8a820',
  moto: '#d98324',
  home: '#3d8c6e',
  life: '#b0506a',
  commercial: '#5b7fb0',
  other: '#8f897b',
}

// Coverage/description keywords that mark a policy as covering a person.
const PERSON_POLICY_RE = /SEPELIO|VIDA|ACCIDENTE|SALUD/i

// A "bien" is a physical insured object. Life/sepelio policies insure a person.
export function isBien(poliza: PolizaListItem): boolean {
  if (poliza.riskType === 'life') return false
  if (poliza.vehiculo) return true
  const descripcion = poliza.bien?.descripcion ?? ''
  if (/\bDNI:/i.test(descripcion)) return false
  if (PERSON_POLICY_RE.test(descripcion)) return false
  const coberturas = poliza.bien?.coberturas ?? []
  if (coberturas.some(c => PERSON_POLICY_RE.test(c.riesgo))) return false
  return true
}

export function isMotoTipo(tipo: string | null | undefined): boolean {
  if (!tipo) return false
  const t = tipo.toUpperCase()
  return t.includes('MOTO') || t === 'MOTOCICLETA'
}

export function effectiveRiskType(poliza: PolizaListItem): RiskType {
  return poliza.vehiculo && isMotoTipo(poliza.vehiculo.tipo) ? 'moto' : poliza.riskType
}

export function polizaSubject(p: PolizaListItem): string {
  if (p.vehiculo) {
    return [p.vehiculo.marca, p.vehiculo.modelo].filter(Boolean).join(' ') || `Póliza ${p.certificado}`
  }
  if (p.bien?.descripcion) return p.bien.descripcion.split(' - DNI:')[0].trim()
  return `Póliza ${p.certificado}`
}

export function isVigente(status: string): boolean {
  return status.toUpperCase().includes('VIGENTE')
}

export function formatCurrency(raw: string | number | null): string {
  if (raw === null || raw === '') return '—'
  const value = typeof raw === 'number' ? raw : parseFloat(raw)
  if (Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Whole days from today until `iso` (negative = past).
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
