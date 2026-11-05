/** One Meta template of a WhatsApp account, as the owner's Plantillas page lists it. */
export interface TemplateRow {
  name: string
  language: string
  /** UTILITY, MARKETING, AUTHENTICATION; null when the account does not have it. */
  category: string | null
  /** Meta's status (APPROVED, PENDING, REJECTED, PAUSED, DISABLED…), or MISSING when the platform needs it and the account lacks it. */
  status: string
  /** Why Meta rejected it. */
  reason: string | null
  /** GREEN, YELLOW, RED or UNKNOWN. */
  quality: string | null
  /** What the platform uses it for; null when it does not use it. */
  use: string | null
  /** The platform sends it now. */
  inUse: boolean
}

export interface TemplatesNumber {
  number: string
  branchName: string | null
  /** GREEN, YELLOW, RED, UNKNOWN; null when Meta did not say. */
  quality: string | null
  /** TIER_250…; null when Meta did not say. */
  messagingLimit: string | null
}

export interface TemplatesAccount {
  id: number
  wabaName: string | null
  numbers: TemplatesNumber[]
  /** Meta did not return the account's templates (an expired token…). */
  error: string | null
  templates: TemplateRow[]
}

export interface TemplatesOverviewResponse {
  checkedAt: string
  organizations: Array<{ id: number; name: string; accounts: TemplatesAccount[] }>
}
