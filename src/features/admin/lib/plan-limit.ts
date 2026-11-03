import type { BillingNumber } from '@/src/types/api/billing'

/** "1 de noviembre", the day a paused number answers again on its own. */
export function resumeDay(row: BillingNumber): string {
  if (!row.limit?.resumesOn) return 'el mes que viene'
  return new Date(`${row.limit.resumesOn}T12:00:00-03:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  })
}
