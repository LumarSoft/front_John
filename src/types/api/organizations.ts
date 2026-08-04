import type { AdminRole } from './auth'

export interface OrganizationCode {
  id: number
  code: string
  holderName: string | null
  isMaster: boolean
  isActive: boolean
  /** Portfolio attributed to this code. */
  clients: number
  polizas: number
  siniestros: number
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
  metaCostUsd: number
  /** What the number costs us (OpenAI + Meta). Measured. */
  totalCostUsd: number
  /** Full monthly charge for the number. */
  billedUsd: number
  /** Portion of that charge run up so far this month. */
  accruedUsd: number
  marginUsd: number
}

export interface OrganizationNumber {
  id: number
  phoneNumberId: string
  number: string
  isActive: boolean
  responsibleCode: { id: number; code: string; holderName: string | null } | null
  servedCodes: Array<{ id: number; code: string }>
  budget: { monthlyBudgetUsd: number | null; exceededAt: string | null }
  usage: PhoneNumberUsage
}

export interface OrganizationBilling {
  period: string
  /** 0–1: how much of the month has gone by. */
  elapsedFraction: number
  activeNumbers: number
  costUsd: number
  billedUsd: number
  accruedUsd: number
  marginUsd: number
}

export interface OrganizationUser {
  id: number
  email: string
  role: AdminRole
  createdAt: string
}

export interface OrganizationSummary {
  id: number
  name: string
  slug: string
  masterCode: string | null
  botName: string | null
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
  isActive: boolean
  createdAt: string
  codes: OrganizationCode[]
  users: OrganizationUser[]
  numbers: OrganizationNumber[]
  billing: OrganizationBilling
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
}

export interface UpdateOrgUserRequest {
  password?: string
  role?: AssignableRole
}
