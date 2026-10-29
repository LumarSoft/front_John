/** A plan of the organization's catalog: a size in tokens and the price its productores pay. */
export interface TokenPlanOption {
  id: number
  name: string
  tokens: number
  priceUsd: number
  /** What the plan costs the organization (tokens at the fixed unit price): SuperAdmin only. */
  costUsd?: number
}

export interface CatalogPlan extends TokenPlanOption {
  /** Price minus cost: SuperAdmin only. */
  marginUsd?: number
  /** Off, the plan no longer places any number. */
  isActive: boolean
  sortOrder: number
}

export interface CatalogResponse {
  unitPriceUsd: number
  plans: CatalogPlan[]
}

/** The plan a number's month is on: a catalog plan, the trial, or a size past the catalog. */
export interface BilledPlan {
  id: number | null
  name: string
  includedTokens: number
  priceUsd: number
  /** SuperAdmin only. */
  costUsd?: number
  trial: boolean
  blocks: number
}

/**
 * A number's running month. Nobody chooses its plan: the tokens it sent place
 * it on the smallest plan that covers them, and it moves up as it sends more.
 */
export interface BillingNumber {
  id: number
  number: string
  isActive: boolean
  responsibleCode: { id: number; code: string; holderName: string | null } | null
  /** The plan this month's tokens placed the number on. */
  plan: BilledPlan
  /** Free tokens applied this month (a new account's first month). */
  trialTokens: number
  tokensUsed: number
  /** The bar's denominator: the trial while it lasts, then the plan plus the trial. */
  includedTokens: number
  remainingTokens: number
  percentUsed: number
  /** Where the number goes past this plan: the next of the catalog, or the next block. */
  nextPlan: { name: string; tokens: number } | null
  /** When the month's counters last moved (ISO), null before the first message. */
  updatedAt: string | null
}

export interface BillingOverview {
  period: string
  unitPriceUsd: number
  blockTokens: number
  trialTokens: number
  plans: TokenPlanOption[]
  numbers: BillingNumber[]
}

export interface CreateTokenPlanRequest {
  name: string
  tokens: number
  /** The price the productores pay; at cost when left out, never below it. */
  priceUsd?: number
  sortOrder?: number
}

export interface UpdateTokenPlanRequest {
  name?: string
  tokens?: number
  priceUsd?: number
  isActive?: boolean
  sortOrder?: number
}
