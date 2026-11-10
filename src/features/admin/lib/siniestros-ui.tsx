import type { SiniestroEstado } from '@/src/services/siniestros.service'

export const TIPO_LABELS: Record<string, string> = {
  auto: 'Auto',
  hogar: 'Hogar',
  robo: 'Robo',
  otro: 'Otro',
}

export function tipoLabel(tipo: string): string {
  return TIPO_LABELS[tipo] ?? tipo
}

/**
 * The day of the incident. It is stored as a calendar date at midnight UTC
 * ("2026-11-09" → 2026-11-09T00:00:00Z), so it is formatted in UTC: in
 * Argentina's time zone it would show the day before.
 */
export function formatOccurredDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** The time of the incident, from the "Hora: …" line the bot writes into the description. */
export function occurredHour(description: string): string | null {
  const hour = /^Hora:\s*(.+)$/im.exec(description)?.[1]?.trim()
  return hour || null
}

export const ESTADO_ORDER: SiniestroEstado[] = ['pending', 'in_progress', 'resolved']

interface EstadoMeta {
  label: string
  /** Soft badge style: background + text + border. */
  badge: string
  /** Solid swatch used as the dot / selected-button accent. */
  dot: string
}

export const ESTADO_META: Record<SiniestroEstado, EstadoMeta> = {
  pending: {
    label: 'Pendiente',
    badge: 'bg-amber/15 text-amber-700 border-amber/30 dark:text-amber',
    dot: 'bg-amber-500',
  },
  in_progress: {
    label: 'En proceso',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
    dot: 'bg-sky-500',
  },
  resolved: {
    label: 'Resuelto',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    dot: 'bg-emerald-500',
  },
}

export function EstadoBadge({ estado, className = '' }: { estado: SiniestroEstado; className?: string }) {
  const meta = ESTADO_META[estado]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${meta.badge} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}
