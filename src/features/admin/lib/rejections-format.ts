import type { Rejection, RejectionStatus } from '@/src/types/api/rejections'

/** Rows the office can still send or mark: never sent, left out, or failed. */
const OPEN: RejectionStatus[] = ['READY', 'SKIPPED', 'FAILED']

export const isOpen = (row: Rejection): boolean => OPEN.includes(row.status)
export const canSend = (row: Rejection): boolean => isOpen(row) && row.waId !== null

const TONES = {
  ready: 'border-ember-ring bg-ember-soft text-ember-2',
  muted: 'border-line-2 bg-secondary text-muted-foreground',
  busy: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
  bad: 'border-destructive/30 bg-destructive/10 text-destructive',
} as const

/** The badge of a row: what happened with its notice. */
export function statusLabel(row: Rejection): { text: string; tone: string } {
  switch (row.status) {
    case 'READY':
      return { text: 'Para enviar', tone: TONES.ready }
    case 'SENDING':
      return { text: 'Enviando…', tone: TONES.busy }
    case 'SENT':
      return { text: 'Enviado', tone: TONES.ok }
    case 'MARKED':
      return { text: 'Avisado a mano', tone: TONES.ok }
    case 'FAILED':
      return { text: 'No se envió', tone: TONES.bad }
    case 'SKIPPED':
      if (row.skipReason === 'NO_PHONE') return { text: 'Sin WhatsApp', tone: TONES.muted }
      if (row.skipReason === 'ALREADY_PAID') return { text: 'Ya pagada', tone: TONES.muted }
      return { text: 'Ya avisado', tone: TONES.muted }
  }
}

/** Counts for the summary of an import. */
export function summarize(rows: Rejection[]) {
  const count = (test: (row: Rejection) => boolean) => rows.filter(test).length
  return {
    ready: count(row => row.status === 'READY'),
    paid: count(row => row.skipReason === 'ALREADY_PAID' && isOpen(row)),
    noPhone: count(row => row.waId === null && isOpen(row)),
    notified: count(row => row.skipReason === 'ALREADY_NOTIFIED' && isOpen(row)),
    sending: count(row => row.status === 'SENDING'),
    sent: count(row => row.status === 'SENT' || row.status === 'MARKED'),
    failed: count(row => row.status === 'FAILED'),
  }
}

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })

export const formatMoney = (amount: number): string => money.format(amount)

/** "2026-09-28" → "28/09/2026". */
export function formatDay(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

/** "20/10 15:24" in local time. */
export function formatMoment(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** "+54 9 341 555-0001" from a WhatsApp id, for reading at a glance. */
export function formatWaId(waId: string): string {
  const match = waId.match(/^549(\d{3})(\d{3,4})(\d{4})$/)
  return match ? `+54 9 ${match[1]} ${match[2]}-${match[3]}` : `+${waId}`
}

/** "VISA DEBITO ··7017" or "Nacion Argentina ··6025": which account or card bounced. */
export function paymentMeans(row: Rejection): string {
  const entity = row.entity
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase())
  return row.accountLast4 ? `${entity} ··${row.accountLast4}` : entity
}
