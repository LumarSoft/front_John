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

/**
 * A number's month. The API sends each role its own part: every role gets the
 * tokens, the SuperAdmin also the activity, and only the OWNER the plan and USD.
 */
export interface PhoneNumberUsage {
  period: string
  /** Messages the platform sent this month: one token each. */
  tokens: number
  /** SuperAdmin and owner: messages sent and the OpenAI calls and tokens. */
  metaMessages?: number
  metaConversations?: number
  openaiCalls?: number
  inputTokens?: number
  outputTokens?: number
  /** Owner only: every block of tokens costs the same, e.g. USD 60 per 1,000. */
  pricing?: { blockTokens: number; blockPriceUsd: number }
  plan?: TokenPlan
  /** True when the Inicial plan was prorated for the number's first month. */
  prorated?: boolean
  /** What the number is invoiced for the month, billed in arrears. */
  billedUsd?: number
  metaBillableMessages?: number
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
  /** Owner only: the OpenAI budget of the month. */
  monthlyBudgetUsd?: number | null
  /** SuperAdmin and owner: the AI paused for the month on reaching its budget. */
  budgetExceededAt?: string | null
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
}

export interface UpdatePhoneNumberRequest {
  number?: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
  isActive?: boolean
}
