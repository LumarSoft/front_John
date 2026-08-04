export interface PhoneNumberCodeRef {
  id: number
  code: string
  holderName: string | null
}

export interface PhoneNumberUsage {
  period: string
  /** Activity of the number: the client may see its own volume. */
  inputTokens: number
  outputTokens: number
  metaConversations: number
  /** Full monthly charge for the number. */
  billedUsd: number
  /** Portion of that charge run up so far this month. */
  accruedUsd: number
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
