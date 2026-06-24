import type { SolicitudStatus } from '@/src/types/api/solicitudes'

export const PRODUCT_LABELS: Record<string, string> = {
  auto: 'Auto',
  moto: 'Moto',
  bici: 'Bici / Monopatín',
  comercio: 'Comercio',
  praxis: 'Praxis',
  personas: 'Personas',
  bolso: 'Bolso',
  hogar: 'Hogar',
}

export function productLabel(productType: string): string {
  return PRODUCT_LABELS[productType] ?? productType
}

export const STATUS_LABELS: Record<SolicitudStatus, string> = {
  NEW: 'Nueva',
  CONTACTED: 'Contactada',
  CLOSED: 'Cerrada',
}

export const STATUS_ORDER: SolicitudStatus[] = ['NEW', 'CONTACTED', 'CLOSED']

/** Semantic colors for the status pill (soft background + matching text). */
export const STATUS_PILL_CLASS: Record<SolicitudStatus, string> = {
  NEW: 'bg-ember-soft text-ember-2 border-ember/25',
  CONTACTED: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  CLOSED: 'bg-secondary text-muted-foreground border-line-2',
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `hace ${d} ${d === 1 ? 'día' : 'días'}`
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
