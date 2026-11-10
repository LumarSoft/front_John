import type { AdminRole } from './auth'
import type { BilledPlan } from './billing'
import type { MetaPortfolio } from './phone-numbers'

export interface OrganizationCode {
  id: number
  code: string
  holderName: string | null
  isMaster: boolean
  isActive: boolean
  /** Portfolio attributed to this code. */
  clients: number
  policies: number
  claims: number
  /** Null until the code completes its first cartera sync. */
  lastCarteraSyncAt: string | null
}

/** Cost and billing of a phone number for the running month. */
export interface PhoneNumberUsage {
  period: string
  openaiInputTokens: number
  openaiOutputTokens: number
  openaiCostUsd: number
  metaConversations: number
  metaMessages: number
  metaBillableMessages: number
  openaiCalls: number
  metaCostUsd: number
  /** What the number costs us (OpenAI + Meta). Measured. */
  totalCostUsd: number
  /** Messages the platform sent this month. */
  messages: number
  assignedPlan: BilledPlan | null
  plan: BilledPlan
  upgraded: boolean
  /** What the platform invoices the organization for the month. */
  billedUsd: number
  /** Billed minus Meta (OpenAI is prepaid). */
  marginUsd: number
}

export interface OrganizationNumber {
  id: number
  phoneNumberId: string
  number: string
  /** The branch the number belongs to, as the office calls it ("27 de Febrero"); absent on older APIs. */
  branchName?: string | null
  isActive: boolean
  responsibleCode: { id: number; code: string; holderName: string | null } | null
  servedCodes: Array<{ id: number; code: string }>
  portfolio?: MetaPortfolio | null
  budget: { monthlyBudgetUsd: number | null; exceededAt: string | null }
  usage: PhoneNumberUsage
}

export interface OrganizationBilling {
  period: string
  /** Messages per block past the largest plan. */
  blockMessages: number
  activeNumbers: number
  metaCostUsd: number
  openaiCostUsd: number
  billedUsd: number
  /** Billed minus Meta (OpenAI is prepaid). */
  marginUsd: number
}

export interface OrganizationUser {
  id: number
  email: string
  role: AdminRole
  createdAt: string
  /** Codes granted to an ADMIN (empty for a SUPERADMIN, who sees them all); absent on older APIs. */
  codes?: Array<{ id: number; code: string; holderName: string | null }>
}

export interface OrganizationSummary {
  id: number
  name: string
  slug: string
  masterCode: string | null
  botName: string | null
  logoUrl?: string | null
  isActive: boolean
  createdAt: string
  counts: {
    codes: number
    users: number
    phoneNumbers: number
    clients: number
  }
}

export interface OrganizationDetail {
  id: number
  name: string
  slug: string
  masterCode: string | null
  botName: string | null
  logoUrl?: string | null
  isActive: boolean
  createdAt: string
  /** The plan the owner put the organization on, or null (automatic). Missing from an older API. */
  planId?: number | null
  /** The plan in effect with no number and for its next number: the chosen one, or the automatic one. */
  startingPlan?: OrganizationStartingPlan | null
  codes: OrganizationCode[]
  users: OrganizationUser[]
  numbers: OrganizationNumber[]
  billing: OrganizationBilling
}

export interface OrganizationStartingPlan {
  id: number
  name: string
  /** The free first-month plan of a new account. */
  trial: boolean
}

export interface SetOrganizationPlanResponse {
  id: number
  planId: number | null
  startingPlan: OrganizationStartingPlan | null
}

export interface CreateOrganizationRequest {
  name: string
  masterCode?: string
  botName?: string
  adminEmail: string
  adminPassword: string
  codes?: Array<{ code: string; holderName?: string }>
}

export interface CreateProducerCodeRequest {
  code: string
  holderName?: string
  isMaster?: boolean
}

export interface UpdateProducerCodeRequest {
  holderName?: string
  isActive?: boolean
}

export interface CreateSuperAdminRequest {
  email: string
  password: string
}

/** Roles the owner can assign inside an organization (never OWNER). */
export type AssignableRole = 'SUPERADMIN' | 'ADMIN'

export interface CreateOrgUserRequest {
  email: string
  password: string
  role: AssignableRole
  /** Codes of the organization an ADMIN will see; ignored for a SUPERADMIN. */
  producerCodeIds?: number[]
}

export interface UpdateOrgUserRequest {
  password?: string
  role?: AssignableRole
}
