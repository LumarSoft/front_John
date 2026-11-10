import type {
  Campaign,
  CampaignCandidate,
  CampaignPlaceholder,
  CampaignSkipReason,
  CampaignTemplate,
  CancellationReason,
  OpportunityLostReason,
  OpportunityStatus,
  SendCampaignResponse,
} from '@/src/types/api/campaigns'

/** The reasons of Bajas y anulaciones, for a chosen one the scope no longer has (the API names the rest). */
export const CANCELLATION_REASON_LABELS: Record<CancellationReason, string> = {
  falta_pago: 'Falta de pago',
  venta: 'Venta del bien',
  desistimiento: 'La pidió el asegurado',
  costo: 'Aumento de costo',
  cambio_compania: 'Cambio de compañía',
  siniestro: 'Siniestro',
  rescision: 'Rescisión',
  no_renovada: 'Venció y no se renovó',
  otros: 'Otros motivos',
}

/** Where an opportunity stands, as the list and the filter name it. */
export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  NEW: 'Sin contactar',
  CONTACTED: 'Contactado',
  REPLIED: 'Respondió',
  QUOTED: 'Cotizado',
  WON: 'Ganada',
  LOST: 'Perdida',
}

export const OPPORTUNITY_STATUS_ORDER: OpportunityStatus[] = ['NEW', 'CONTACTED', 'REPLIED', 'QUOTED', 'WON', 'LOST']

export const OPPORTUNITY_STATUS_CLASSES: Record<OpportunityStatus, string> = {
  NEW: 'border-line-2 bg-secondary text-muted-foreground',
  CONTACTED: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-400',
  REPLIED: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400',
  QUOTED:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-400',
  WON: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
  LOST: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400',
}

export const LOST_REASON_LABELS: Record<OpportunityLostReason, string> = {
  PRICE: 'Precio',
  OTHER_INSURER: 'Se fue a otra compañía',
  NO_ANSWER: 'No contesta',
  SOLD_ASSET: 'Vendió el bien',
  OTHER: 'Otro motivo',
}

export const LOST_REASON_ORDER: OpportunityLostReason[] = ['PRICE', 'OTHER_INSURER', 'NO_ANSWER', 'SOLD_ASSET', 'OTHER']

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

/** "$ 512.000": the premium of what was sold. */
export function formatPremium(amount: number): string {
  return pesos.format(amount)
}

/** "42 %" of a whole, or "—" when there is nothing to divide by. */
export function formatRate(part: number, whole: number): string {
  if (!whole) return '—'
  return `${Math.round((part / whole) * 100)} %`
}

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
    if (campaign.plan.byRole)
      return 'Tu usuario no tiene habilitada esta campaña. Lo define el soporte de la plataforma.'
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
    // The API's own values, when it sends them: the preview then reads exactly like the message.
    ...candidate.values,
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

/** "15, 7 15" → [15, 7]: the days of a setting, as typed, longest first; NaN for what is not a whole number. */
export function parseDays(text: string): number[] {
  const days = text
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map(day => (/^\d+$/.test(day) ? Number(day) : Number.NaN))
  return [...new Set(days)].sort((a, b) => b - a)
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
