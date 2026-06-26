import type { AdminRole } from './auth'

export interface OrganizationCode {
  id: number
  code: string
  holderName: string | null
  isMaster: boolean
  isActive: boolean
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
