export type RejectionStatus = 'READY' | 'SKIPPED' | 'SENDING' | 'SENT' | 'FAILED' | 'MARKED'
export type RejectionSkipReason = 'NO_PHONE' | 'ALREADY_PAID' | 'ALREADY_NOTIFIED'

interface RejectionPerson {
  name: string | null
  email: string
}

export interface RejectionImportSummary {
  id: number
  fileName: string
  periodLabel: string | null
  createdAt: string
  createdBy: RejectionPerson
  counts: Partial<Record<RejectionStatus, number>>
}

export interface RejectionImportList {
  // False until the WhatsApp template is approved and configured in the API.
  templateReady: boolean
  imports: RejectionImportSummary[]
}

export interface Rejection {
  id: number
  rowNumber: number
  holderName: string
  branch: number | null
  certificateNumber: string
  endorsementNumber: number | null
  installmentNumber: number
  dueDate: string
  amount: number
  entity: string
  channel: 'ACCOUNT' | 'CARD'
  accountLast4: string | null
  reason: string
  stillPending: boolean
  phone: string | null
  waId: string | null
  status: RejectionStatus
  skipReason: RejectionSkipReason | null
  error: string | null
  sentAt: string | null
  conversationId: number | null
  client: { id: number; firstName: string; lastName: string } | null
  sentBy: RejectionPerson | null
  // The notice exactly as the client gets it.
  message: string
}

export interface RejectionImport {
  id: number
  fileName: string
  periodLabel: string | null
  createdAt: string
  createdBy: RejectionPerson
  templateReady: boolean
  rows: Rejection[]
}

/** A row of Triunfo's Excel, read in the browser. */
export interface RejectionRowInput {
  rowNumber: number
  holderName: string
  branch?: number
  certificateNumber: string
  endorsementNumber?: number
  installmentNumber: number
  dueDate: string
  amount: number
  entity: string
  accountLast4?: string
  reason: string
  stillPending: boolean
  mobilePhone?: string
  homePhone?: string
}

export interface CreateRejectionImportRequest {
  fileName: string
  periodLabel?: string
  producerCode?: string
  rows: RejectionRowInput[]
}
