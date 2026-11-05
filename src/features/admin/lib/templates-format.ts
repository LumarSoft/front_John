import type { TemplatesAccount } from '@/src/types/api/templates'

const RED = 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'
const AMBER =
  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400'
const GREEN =
  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400'
const NEUTRAL = 'border-line-2 bg-secondary text-muted-foreground'

/** Meta's status of a template (or MISSING), said for the owner, with its chip colours. */
export function templateStatus(status: string): { label: string; classes: string } {
  switch (status) {
    case 'APPROVED':
      return { label: 'Aprobada', classes: GREEN }
    case 'PENDING':
      return { label: 'En revisión', classes: AMBER }
    case 'IN_APPEAL':
      return { label: 'En apelación', classes: AMBER }
    case 'REJECTED':
      return { label: 'Rechazada', classes: RED }
    case 'PAUSED':
      return { label: 'Pausada', classes: RED }
    case 'DISABLED':
      return { label: 'Desactivada', classes: RED }
    case 'MISSING':
      return { label: 'Falta en esta cuenta', classes: RED }
    default:
      return { label: status, classes: NEUTRAL }
  }
}

const CATEGORIES: Record<string, string> = {
  UTILITY: 'Utilidad',
  MARKETING: 'Marketing',
  AUTHENTICATION: 'Autenticación',
}

export function categoryLabel(category: string | null): string {
  return category ? (CATEGORIES[category] ?? category) : '—'
}

const QUALITY: Record<string, { label: string; dot: string }> = {
  GREEN: { label: 'Calidad alta', dot: 'bg-emerald-500' },
  YELLOW: { label: 'Calidad media', dot: 'bg-amber-500' },
  RED: { label: 'Calidad baja', dot: 'bg-red-500' },
}

/** The quality Meta gives a number or a template; "sin datos" until enough was sent to tell. */
export function qualityOf(quality: string | null): { label: string; dot: string } {
  return (quality && QUALITY[quality]) || { label: 'Calidad sin datos', dot: 'bg-faint' }
}

const LIMITS: Record<string, string> = {
  TIER_50: '50',
  TIER_250: '250',
  TIER_1K: '1.000',
  TIER_2K: '2.000',
  TIER_10K: '10.000',
  TIER_100K: '100.000',
}

/** How many people a day the number may start a chat with. */
export function messagingLimitLabel(tier: string | null): string | null {
  if (!tier) return null
  if (tier === 'TIER_UNLIMITED') return 'Sin límite de chats nuevos por día'
  return LIMITS[tier] ? `Hasta ${LIMITS[tier]} chats nuevos por día` : tier
}

/** A template the platform needs that the account lacks or Meta has not approved. */
export function needsAttention(account: TemplatesAccount): number {
  return account.templates.filter(t => t.inUse && t.status !== 'APPROVED').length
}
