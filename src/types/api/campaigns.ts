import type { CobranzasScopeQuery } from './cobranzas'

/** The sales campaigns of Nico's proposal: who the portfolio suggests offering something to. */
export type CampaignKind = 'coverage_upgrade' | 'quote_followup' | 'renewal' | 'winback' | 'cross_sell'

/** Meta's review of the campaign's message in one WhatsApp account. */
export type CampaignTemplateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED' | 'ERROR'

export interface CampaignTemplate {
  /** Meta's name of the WhatsApp account. */
  wabaName: string | null
  /** The numbers of that account, as displayed ("+54 9 341 275-7294 · 27 de Febrero"). */
  numbers: string[]
  status: CampaignTemplateStatus
  /** Meta's rejection reason, or our own error. */
  reason: string | null
}

/**
 * What a campaign's client list can be narrowed by besides the scope and the
 * search. `gap` is what the client lacks: a protection (Mejora de coberturas)
 * or a product (Venta cruzada).
 */
export type CampaignFilter = 'coverage' | 'reason' | 'gap'

/** Why a policy was lost (Bajas y anulaciones): Triunfo's cancellation, or it ran out unrenewed. */
export type CancellationReason =
  | 'falta_pago'
  | 'venta'
  | 'desistimiento'
  | 'costo'
  | 'cambio_compania'
  | 'siniestro'
  | 'rescision'
  | 'no_renovada'
  | 'otros'

/** The column a campaign's client list is sorted by: its date (Motivo), the client, the vehicle or the last message. */
export type CampaignSortField = 'date' | 'name' | 'item' | 'lastMessage'

export type CampaignSortOrder = 'asc' | 'desc'

export interface CampaignSort {
  by: CampaignSortField
  order: CampaignSortOrder
}

export interface CampaignSettingField {
  key: string
  label: string
  /**
   * `codes`: a list of coverage codes (["A", "B", "B1"]) and `days`: a list of
   * whole days ([15, 7], may be empty), both edited as comma-separated text;
   * `options`: some of `options`, at least one.
   */
  type: 'number' | 'codes' | 'days' | 'options'
  min?: number
  max?: number
  options?: Array<{ value: string; label: string }>
  help: string
}

export type CampaignSettingValue = number | string[] | number[]

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
  /** How the campaign works, in a few sentences with the organization's settings (missing from an older API). */
  howItWorks?: string[]
  enabled: boolean
  /** 0–100, integer. */
  discountPercent: number
  /** The message, with `{nombre}`, `{porcentaje}`, `{bien}`, `{vencimiento}`. */
  body: string
  placeholders: CampaignPlaceholder[]
  settings: Record<string, CampaignSettingValue>
  settingFields: CampaignSettingField[]
  /** Missing from an older API. */
  filters?: CampaignFilter[]
  /** One per WhatsApp account of the organization. */
  templates: CampaignTemplate[]
  /** Some sending number has this message approved by Meta. */
  ready: boolean
  /** byRole: the plans include it but the user's role has it off (missing from an older API). */
  plan: { included: boolean; availableIn: string | null; byRole?: boolean }
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
  settings?: Record<string, CampaignSettingValue>
}

export type CampaignMessageStatus = 'SENDING' | 'SENT' | 'FAILED' | 'MARKED'

/**
 * Where a client's opportunity stands: opened by a send or "ya lo contactamos",
 * moved forward by the platform (the customer answered, a quote, a new policy)
 * and closed by the office as won or lost.
 */
export type OpportunityStatus = 'NEW' | 'CONTACTED' | 'REPLIED' | 'QUOTED' | 'WON' | 'LOST'

export type OpportunityLostReason = 'PRICE' | 'OTHER_INSURER' | 'NO_ANSWER' | 'SOLD_ASSET' | 'OTHER'

export interface OpportunityPerson {
  id: number
  name: string | null
}

export interface CampaignOpportunity {
  id: number
  status: OpportunityStatus
  statusLabel: string
  assignedTo: OpportunityPerson | null
  assignedAt: string | null
  contactedAt: string | null
  repliedAt: string | null
  quotedAt: string | null
  wonAt: string | null
  lostAt: string | null
  lostReason: OpportunityLostReason | null
  lostReasonLabel: string | null
  note: string | null
  /** The premium of the sale, when known. */
  wonPremium: number | null
}

/**
 * The next contact of a campaign that writes more than once (the second
 * contact of a quote, the reminders of a renewal): `due` puts the client back
 * on the to-do and lets the campaign write again.
 */
export interface CampaignFollowUp {
  step: number
  of: number
  due: boolean
  /** "Segundo contacto", "Recordatorio: faltan 7 días". */
  label: string
}

export interface CampaignCandidate {
  /** Policy id (quote id in `quote_followup`): what send, mark, opt-out, assign and the opportunity take. */
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
  /** Who said so: the client in the chat, or the office for them (missing from an older API). */
  optedOutBy?: 'client' | 'office' | null
  /** Null for a first contact or a campaign that writes once (missing from an older API). */
  followUp?: CampaignFollowUp | null
  /** What the client lacks: protections, the insured sum, products (missing from an older API). */
  gaps?: Array<{ value: string; label: string }>
  /** Cotizaciones sin cerrar: the lowest instalment quoted and the insurer (missing from an older API). */
  amount?: number | null
  company?: string | null
  /** Who follows it and where it stands; null until somebody contacts or assigns it (missing from an older API). */
  opportunity?: CampaignOpportunity | null
  /** Bajas y anulaciones: what the client told the bot when asking to cancel (missing from an older API). */
  customerReason?: string | null
}

/** Where the opportunity stands, or `none`: nobody contacted or assigned yet. */
export type OpportunityFilter = 'none' | OpportunityStatus

export interface CampaignCandidatesQuery extends Omit<CobranzasScopeQuery, 'paymentMethod'> {
  search?: string
  /** A coverage code ("A", "C2 Full"). */
  coverage?: string
  reason?: CancellationReason
  /** What the client lacks ("granizo", "home"…). */
  gap?: string
  /** Only who can be written to now: never contacted, or with a follow-up due. */
  due?: boolean
  status?: OpportunityFilter
  assignedToId?: number
  /** Only the opportunities the user follows. */
  mine?: boolean
  /** Default: the date, newest first (in Renovaciones, the one that ends soonest). */
  sort?: CampaignSortField
  order?: CampaignSortOrder
  page?: number
  pageSize?: number
}

export interface CampaignFilterOption<T extends string = string> {
  value: T
  count: number
}

export interface CampaignCandidatesResponse {
  data: CampaignCandidate[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  /** The column and direction applied: the default when none was asked. Missing from an older API. */
  sort?: CampaignSort
  /** The choices of the campaign's filters in the scope, with how many each has; null when it has none. */
  filters?: {
    coverages: CampaignFilterOption[] | null
    /** Missing from an older API. */
    gaps?: Array<CampaignFilterOption & { label: string }> | null
    reasons: Array<CampaignFilterOption<CancellationReason> & { label: string }> | null
  }
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

export interface OptInCampaignResponse {
  restored: number
}

/** "Crear tarea": one task per chosen client for one person of the office. */
export interface CreateCampaignTasksRequest {
  ids: number[]
  assignedToId: number
  /** YYYY-MM-DD. */
  dueDate?: string
  note?: string
}

export interface CreateCampaignTasksResponse {
  created: number
}

export interface AssignOpportunitiesRequest {
  ids: number[]
  /** null takes the assignee off. */
  assignedToId: number | null
}

export interface AssignOpportunitiesResponse {
  assigned: number
}

/** What the office says about one opportunity; what is left out stays. */
export interface UpdateOpportunityRequest {
  /** WON, LOST or CONTACTED (reopened). */
  status?: 'WON' | 'LOST' | 'CONTACTED'
  lostReason?: OpportunityLostReason
  wonPremium?: number | null
  note?: string | null
  assignedToId?: number | null
}

export interface CampaignResultsQuery extends Omit<CobranzasScopeQuery, 'paymentMethod'> {
  kind?: CampaignKind
  /** ISO day (YYYY-MM-DD) or instant; a day covers the whole day. */
  from?: string
  to?: string
  assignedToId?: number
}

export interface CampaignResultCounts {
  contacted: number
  replied: number
  quoted: number
  won: number
  lost: number
  open: number
  /** The premium of what was sold, in pesos. */
  premium: number
}

export interface CampaignResultRow extends CampaignResultCounts {
  kind: CampaignKind
  label: string
  sent: number
  marked: number
}

export interface CampaignResultsResponse {
  from: string
  to: string
  campaigns: CampaignResultRow[]
  totals: CampaignResultCounts & { sent: number; marked: number }
  byAssignee: Array<CampaignResultCounts & { user: OpportunityPerson | null }>
}
