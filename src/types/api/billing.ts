/** A plan of the platform's catalog as the organizations see it: messages a month for a price. */
export interface PlanOffer {
  id: number
  name: string
  messages: number
  priceUsd: number
  /** The free first-month plan of a new account's number. */
  isTrial: boolean
}

/** A plan of the catalog as the owner edits it. */
export interface CatalogPlan extends PlanOffer {
  /** Off: the numbers on it keep it, but no number moves to it. */
  isActive: boolean
  sortOrder: number
}

export interface CatalogResponse {
  /** Messages per block past the largest plan. */
  blockMessages: number
  plans: CatalogPlan[]
}

/** The plan a number's month is billed on: a catalog plan, or the largest plus blocks past the catalog. */
export interface BilledPlan {
  /** The catalog plan, or null past the largest one. */
  id: number | null
  name: string
  includedMessages: number
  priceUsd: number
  trial: boolean
  /** Blocks past the largest plan (0 inside the catalog). */
  extraBlocks: number
}

/** Where a number stands against its plan's limit this month. */
export interface PlanLimit {
  /** The month's messages reached what the plan includes. */
  reached: boolean
  /** Its assistant is paused this month until someone continues on `nextPlan`. */
  paused: boolean
  /** Someone chose to keep it paused until next month. */
  confirmed: boolean
  pausedAt: string | null
  /** The first day it answers again on its own ("YYYY-MM-01"). */
  resumesOn: string | null
}

/** A number's running month in Facturación. */
export interface BillingNumber {
  id: number
  number: string
  isActive: boolean
  responsibleCode: { id: number; code: string; holderName: string | null } | null
  /** The plan the number is on (the SuperAdmin's choice, or the smallest paid plan). */
  assignedPlan: BilledPlan | null
  /** The plan the month is billed on. */
  plan: BilledPlan
  /** Past its plan this month, or already moved up on its own this month. */
  upgraded: boolean
  /** When it moved up on its own this month (ISO), or null. */
  movedUpAt: string | null
  messagesUsed: number
  includedMessages: number
  remainingMessages: number
  percentUsed: number
  /** Where the number goes past this plan: the next of the catalog, or the next block. */
  nextPlan: { name: string; messages: number; priceUsd: number } | null
  /** The whole plan for the organization; prorated in the first month for the owner only. */
  billedUsd: number
  prorated: boolean
  /** Missing from an API older than the plan limit pause. */
  limit?: PlanLimit
  /** When the month's counters last moved (ISO), null before the first message. */
  updatedAt: string | null
}

export interface BillingOverview {
  period: string
  blockMessages: number
  /** The active plans of the catalog. */
  plans: PlanOffer[]
  numbers: BillingNumber[]
  /** SuperAdmin and owner: what the organization pays this month. */
  totalBilledUsd?: number
}

export interface CreatePlanRequest {
  name: string
  messages: number
  priceUsd: number
  isTrial?: boolean
  sortOrder?: number
}

export interface UpdatePlanRequest {
  name?: string
  messages?: number
  priceUsd?: number
  isTrial?: boolean
  isActive?: boolean
  sortOrder?: number
}

/** The owner's month: billed vs what Meta really charged, OpenAI apart. */
export interface OwnerBillingTotals {
  messages: number
  /** Messages Meta charged for (past the free service messages, and every template). */
  metaBillableMessages: number
  billedUsd: number
  metaCostUsd: number
  /** Prepaid: shown apart, outside the profit. */
  openaiCostUsd: number
  /** billedUsd − metaCostUsd. */
  profitUsd: number
}

export interface OwnerBillingNumber extends OwnerBillingTotals {
  id: number
  number: string
  isActive: boolean
  responsibleCode: { code: string; holderName: string | null } | null
  plan: BilledPlan
  assignedPlan: BilledPlan | null
  upgraded: boolean
  prorated: boolean
  /** Its assistant is paused this month for reaching the plan. */
  paused: boolean
}

export interface OwnerBillingOrganization {
  id: number
  name: string
  isActive: boolean
  numbers: OwnerBillingNumber[]
  totals: OwnerBillingTotals
}

export interface OwnerBilling {
  period: string
  organizations: OwnerBillingOrganization[]
  totals: OwnerBillingTotals & {
    organizations: number
    activeNumbers: number
    upgradedNumbers: number
    pausedNumbers: number
  }
}
