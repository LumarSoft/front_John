import type { RiskType } from './clients'
import type { CobranzasScopeQuery } from './cobranzas'

/** `oldest`: longest expired first (default). `recent`: most recently expired first. */
export type ExpiredPolicySort = 'oldest' | 'recent'

/** A policy that ran out and was not renewed, from the cobranzas "pólizas vencidas" worklist. */
export interface ExpiredPolicy {
  id: number
  certificateNumber: string
  riskType: RiskType
  /** What a non-vehicle policy covers ("Acc. personales"), null for vehicles. */
  product: string | null
  licensePlate: string | null
  /** "FIAT PALIO 2024", null without a vehicle. */
  vehicle: string | null
  validTo: string | null
  daysExpired: number
  paymentMethod: string | null
  producerCode: { id: number; code: string } | null
  client: {
    id: number
    firstName: string
    lastName: string
    dni: string
    phone: string | null
    email: string | null
  }
  unpaidInstallments: number
  hiddenAt: string | null
  hiddenReason: string | null
}

export interface ExpiredPoliciesPage {
  data: ExpiredPolicy[]
  total: number
  /** Hidden policies in scope, whatever `hidden` asked for. */
  hiddenCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ExpiredPoliciesQuery extends CobranzasScopeQuery {
  search?: string
  /** `true` lists the hidden policies instead of the visible ones. */
  hidden?: boolean
  sort?: ExpiredPolicySort
  page?: number
  pageSize?: number
}

export interface HidePolicyRequest {
  reason?: string
}

export interface HidePolicyResponse {
  id: number
  hiddenAt: string | null
  hiddenReason: string | null
}
