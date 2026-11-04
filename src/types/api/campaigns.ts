import type { CobranzasScopeQuery } from './cobranzas'

/** The sales campaigns of Nico's proposal: who the portfolio suggests offering something to. */
export type CampaignKind = 'coverage_upgrade' | 'quote_followup' | 'renewal' | 'winback' | 'cross_sell'

/** Meta's review of the campaign's message in one WhatsApp account. */
export type CampaignTemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED' | 'ERROR'

export interface CampaignTemplate {
  /** Meta's name of the WhatsApp account. */
  wabaName: string | null
  /** The numbers of that account, as displayed ("+54 9 341 275-7294"). */
  numbers: string[]
  status: CampaignTemplateStatus
  /** Meta's rejection reason, or our own error. */
  reason: string | null
}

export interface CampaignSettingField {
  key: string
  label: string
  /** `codes`: a list of coverage codes (["A", "B", "B1"]), edited as comma-separated text. */
  type: 'number' | 'codes'
  min?: number
  max?: number
  help: string
}

export interface CampaignPlaceholder {
  /** Without braces: "nombre" is written `{nombre}` in the message. */
  key: string
  label: string
  example: string
}

export interface Campaign {
  kind: CampaignKind
  label: string
  description: string
  enabled: boolean
  /** 0–100, integer. */
  discountPercent: number
  /** The message, with `{nombre}`, `{porcentaje}`, `{bien}`, `{vencimiento}`. */
  body: string
  placeholders: CampaignPlaceholder[]
  settings: Record<string, number | string[]>
  settingFields: CampaignSettingField[]
  /** One per WhatsApp account of the organization. */
  templates: CampaignTemplate[]
  /** Some sending number has this message approved by Meta. */
  ready: boolean
  plan: { included: boolean; availableIn: string | null }
  /** Clients the campaign finds now, in the user's scope. */
  candidates: number
  /** The message rendered with the example values. */
  preview: string
  updatedAt: string | null
}

export interface CampaignsResponse {
  campaigns: Campaign[]
}

export interface UpdateCampaignRequest {
  enabled?: boolean
  discountPercent?: number
  body?: string
  settings?: Record<string, number | string[]>
}

export type CampaignMessageStatus = 'SENDING' | 'SENT' | 'FAILED' | 'MARKED'

export interface CampaignCandidate {
  /** Policy id (quote id in `quote_followup`): what send, mark and opt-out take. */
  id: number
  client: { id: number | null; name: string; dni: string | null; phone: string | null }
  /** "Ford Ka 2015 · AB123CD", or the product. */
  item: string
  /** Why it is listed: "Cobertura A", "Cotizó el 30/10/2026", "Vence el 20/11/2026"… */
  detail: string
  /** ISO of the date that matters for the campaign. */
  date: string | null
  producerCode: { id: number; code: string } | null
  /** What the message fills in for this person ({ nombre, bien, vencimiento }). Missing from an older API. */
  values?: Record<string, string>
  lastMessage: { status: CampaignMessageStatus; sentAt: string | null; createdAt: string; error: string | null } | null
  optedOut: boolean
}

export interface CampaignCandidatesQuery extends Omit<CobranzasScopeQuery, 'paymentMethod'> {
  search?: string
  page?: number
  pageSize?: number
}

export interface CampaignCandidatesResponse {
  data: CampaignCandidate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type CampaignSkipReason = 'NO_PHONE' | 'ALREADY_SENT' | 'SENDING' | 'OPTED_OUT'

export interface SendCampaignResponse {
  sent: number
  skipped: Array<{ id: number; reason: CampaignSkipReason }>
}

export interface MarkCampaignResponse {
  marked: number
}

export interface OptOutCampaignResponse {
  optedOut: number
}
