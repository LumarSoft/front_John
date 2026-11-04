import type {
  Campaign,
  CampaignCandidate,
  CampaignPlaceholder,
  CampaignSkipReason,
  CampaignTemplate,
  SendCampaignResponse,
} from '@/src/types/api/campaigns'

/** What the office reads of Meta's review of a campaign's message. */
export type CampaignReview = 'APPROVED' | 'PENDING' | 'REJECTED' | 'ERROR' | 'NOT_SUBMITTED'

export const REVIEW_LABELS: Record<CampaignReview, string> = {
  APPROVED: 'Aprobado por Meta',
  PENDING: 'En revisión de Meta',
  REJECTED: 'Rechazado por Meta',
  ERROR: 'No se pudo mandar a Meta',
  NOT_SUBMITTED: 'Sin enviar a Meta',
}

export const REVIEW_CLASSES: Record<CampaignReview, string> = {
  APPROVED:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400',
  REJECTED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400',
  ERROR: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400',
  NOT_SUBMITTED: 'border-line-2 bg-secondary text-muted-foreground',
}

/** One status for the whole campaign: approved in some account wins, then pending, rejected, error. */
export function campaignReview(templates: CampaignTemplate[]): CampaignReview {
  const order: CampaignReview[] = ['APPROVED', 'PENDING', 'REJECTED', 'ERROR']
  return order.find(status => templates.some(t => t.status === status)) ?? 'NOT_SUBMITTED'
}

/** Why the office cannot send a campaign now, or null when it can. */
export function sendBlockedReason(campaign: Campaign): string | null {
  if (!campaign.plan.included) {
    return campaign.plan.availableIn
      ? `Tu plan no incluye esta campaña: está desde el plan ${campaign.plan.availableIn}.`
      : 'Tu plan no incluye esta campaña.'
  }
  if (!campaign.enabled) return 'La campaña está apagada. Prendela para poder enviarla.'
  if (campaign.ready) return null
  const review = campaignReview(campaign.templates)
  if (review === 'REJECTED') return 'Meta rechazó el mensaje: corregilo en la pestaña Mensaje y guardalo de nuevo.'
  if (review === 'ERROR') return 'El mensaje no llegó a Meta: revisá la pestaña Mensaje.'
  return 'El mensaje está en revisión de Meta. Cuando lo aprueben se puede enviar.'
}

/** The message with each `{key}` replaced; a key without a value stays as written. */
export function renderMessage(body: string, values: Record<string, string>): string {
  return body.replace(/\{([a-z_]+)\}/g, (match, key: string) => values[key] ?? match)
}

/** The placeholders' example values, with the percentage being edited. */
export function exampleValues(placeholders: CampaignPlaceholder[], discountPercent: string): Record<string, string> {
  const values = Object.fromEntries(placeholders.map(p => [p.key, p.example]))
  return { ...values, porcentaje: discountPercent }
}

/** dd/mm/yyyy, as the message shows dates. */
export function shortDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** The client's first name: "PEREZ, JUAN CARLOS" and "Juan Carlos Pérez" both give the first given name. */
export function firstName(name: string): string {
  const given = name.includes(',') ? name.split(',')[1] : name
  const first = given.trim().split(/\s+/)[0] ?? ''
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : name
}

/** The message as this client will read it. */
export function candidateMessage(campaign: Campaign, candidate: CampaignCandidate): string {
  return renderMessage(campaign.body, {
    ...exampleValues(campaign.placeholders, String(campaign.discountPercent)),
    nombre: firstName(candidate.client.name),
    bien: candidate.item,
    vencimiento: shortDate(candidate.date),
  })
}

/** "A, b1  B" → ["A", "B1", "B"]: the coverage codes of a setting, as typed. */
export function parseCodes(text: string): string[] {
  const codes = text
    .split(/[,;\s]+/)
    .map(code => code.trim().toUpperCase())
    .filter(Boolean)
  return [...new Set(codes)]
}

const SKIP_LABELS: Record<CampaignSkipReason, string> = {
  NO_PHONE: 'sin WhatsApp',
  ALREADY_SENT: 'ya se le escribió hace poco',
  SENDING: 'se está enviando',
  OPTED_OUT: 'no quiere recibir',
}

/** What a send came back with, in one line for the office. */
export function summarizeSend(result: SendCampaignResponse): string {
  const sent = result.sent === 1 ? '1 mensaje en camino' : `${result.sent} mensajes en camino`
  if (!result.skipped.length) return sent
  const reasons = new Map<CampaignSkipReason, number>()
  for (const s of result.skipped) reasons.set(s.reason, (reasons.get(s.reason) ?? 0) + 1)
  const skipped = [...reasons].map(([reason, n]) => `${n} ${SKIP_LABELS[reason]}`).join(', ')
  return `${sent}; sin enviar: ${skipped}`
}
