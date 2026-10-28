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
  /** The last WhatsApp notice tried for this policy, or null. */
  notice: ExpiryNotice | null
}

export type ExpiryNoticeStatus = 'SENDING' | 'SENT' | 'FAILED' | 'MARKED'

export interface ExpiryNotice {
  id: number
  status: ExpiryNoticeStatus
  sentAt: string | null
  createdAt: string
  error: string | null
}

export interface ExpiredPoliciesPage {
  data: ExpiredPolicy[]
  total: number
  /** Hidden policies in scope, whatever `hidden` asked for. */
  hiddenCount: number
  /** Whether the Meta template is configured: without it notices can only be marked. */
  templateReady: boolean
  page: number
  pageSize: number
  totalPages: number
}

/** Why a chosen policy was not sent a notice. */
export type ExpiryNoticeSkipReason = 'NO_PHONE' | 'ALREADY_NOTIFIED' | 'SENDING'

export interface SendExpiryNoticesResponse {
  sent: number
  skipped: { policyId: number; reason: ExpiryNoticeSkipReason }[]
}

export interface MarkExpiryNoticesResponse {
  marked: number
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
