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
  isActive: boolean
  sortOrder: number
  /** Numbers currently on this plan. */
  numbersOnPlan: number
}

export interface CatalogResponse {
  unitPriceUsd: number
  plans: CatalogPlan[]
}

/** What a number's month is billed on: a catalog plan, the trial, or a size past the catalog. */
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

export interface BillingNumber {
  id: number
  number: string
  isActive: boolean
  responsibleCode: { id: number; code: string; holderName: string | null } | null
  /** The number's own plan (the smallest of the catalog when none was chosen); null without a catalog. */
  plan: TokenPlanOption | null
  /** Free tokens applied this month (a new account's first month). */
  trialTokens: number
  tokensUsed: number
  /** The bar's denominator: the number's plan plus the trial. */
  includedTokens: number
  remainingTokens: number
  percentUsed: number
  /** The month went past the number's own plan. */
  exceeded: boolean
  billedPlan: BilledPlan
  /** What the number's productor pays for the month at the catalog's prices. */
  estimatedUsd: number
  /** What the number costs the organization this month, and what it keeps: SuperAdmin only. */
  costUsd?: number
  marginUsd?: number
  prorated: boolean
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
  totalEstimatedUsd: number
  /** SuperAdmin only. */
  totalCostUsd?: number
  totalMarginUsd?: number
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
