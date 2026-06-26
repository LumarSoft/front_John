export interface PhoneNumberCodeRef {
  id: number
  code: string
  holderName: string | null
}

export interface PhoneNumberUsage {
  period: string
  openaiCostUsd: number
  metaCostUsd: number
  totalCostUsd: number
  inputTokens: number
  outputTokens: number
  metaConversations: number
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
