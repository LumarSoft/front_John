export interface PhoneNumberCodeRef {
  id: number
  code: string
  holderName: string | null
}

/** The token plan a number is billed on for a month (1 token = 1 message sent). */
export interface TokenPlan {
  /** 1,000-token blocks: 1 = Inicial, 2 = Estándar… */
  blocks: number
  name: string
  includedTokens: number
  priceUsd: number
}

export interface PhoneNumberUsage {
  period: string
  /** Every block of tokens costs the same: e.g. USD 50 per 1,000. */
  pricing: { blockTokens: number; blockPriceUsd: number }
  /** Activity of the number: the client may see its own volume. */
  inputTokens: number
  outputTokens: number
  metaConversations: number
  metaMessages: number
  metaBillableMessages?: number
  openaiCalls: number
  /** Messages the platform sent this month: one token each. */
  tokens: number
  plan: TokenPlan
  /** True when the Inicial plan was prorated for the number's first month. */
  prorated: boolean
  /** What the number is invoiced for the month, billed in arrears. */
  billedUsd: number
  /**
   * Provider cost and margin. Only present for the platform OWNER — the API
   * omits these fields for tenant roles, so the client never sees our cost.
   */
  openaiCostUsd?: number
  metaCostUsd?: number
  totalCostUsd?: number
  marginUsd?: number
}

export interface AdminPhoneNumber {
  id: number
  phoneNumberId: string
  number: string
  isActive: boolean
  monthlyBudgetUsd: number | null
  budgetExceededAt: string | null
  /** Set when Meta dropped the number off the WhatsApp API; cleared by reconnecting. */
  disconnectedAt: string | null
  /** Meta's reason code, e.g. BUSINESS_DOWNGRADE. */
  disconnectReason: string | null
  /** The reason in plain words, for the office. */
  disconnectReasonLabel: string | null
  responsibleCode: PhoneNumberCodeRef | null
  servedCodes: PhoneNumberCodeRef[]
  usage: PhoneNumberUsage
}

export interface CreatePhoneNumberRequest {
  phoneNumberId: string
  number: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
  monthlyBudgetUsd?: number
}

export interface UpdatePhoneNumberRequest {
  number?: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
  monthlyBudgetUsd?: number
  isActive?: boolean
}
