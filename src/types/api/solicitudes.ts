export type SolicitudKind = 'lead' | 'cotizacion'
export type SolicitudStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

export interface SolicitudListItem {
  id: number
  kind: SolicitudKind
  productType: string
  contactName: string
  phone: string
  email: string | null
  summary: string | null
  channel: string | null
  status: SolicitudStatus
  createdAt: string
}

export interface SolicitudesQuery {
  status?: SolicitudStatus
  productType?: string
  kind?: SolicitudKind
  search?: string
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
  page?: number
  pageSize?: number
}

export interface SolicitudesPage {
  data: SolicitudListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** The WhatsApp chat a bot lead came from, shown in the solicitud's "Chat" tab. */
export interface SolicitudConversation {
  id: number
  status: 'open' | 'pending' | 'closed'
  contactName: string | null
}

export interface LeadDetail {
  kind: 'lead'
  id: number
  productType: string
  channel: string
  status: SolicitudStatus
  contactName: string
  phone: string
  email: string | null
  payload: Record<string, unknown>
  notes: string | null
  createdAt: string
  selectedPlan: { id: number; name: string; monthlyPrice: number; productType: string } | null
  /** Null for a web lead, or when the chat was deleted from the inbox. */
  conversation: SolicitudConversation | null
}

export interface CotizacionPaymentOption {
  name: string
  premium: number
  installmentValue: number
  installments: number
}

export interface CotizacionCoverageView {
  code: string
  paymentOptions: CotizacionPaymentOption[]
}

export interface CotizacionDetail {
  kind: 'cotizacion'
  id: number
  status: SolicitudStatus
  notes: string | null
  selectedCoverage: string
  // All quoted coverages with prices (same figures shown to the client on web/bot).
  coverages: CotizacionCoverageView[]
  coverageStartDate: string
  applicantType: string
  applicantFirstName: string
  applicantLastName: string | null
  applicantEmail: string
  applicantPhone: string
  applicantDocType: string
  applicantDocNumber: string
  applicantAddress: string
  paymentMethod: string
  createdAt: string
  quote: { quoteNumber: number; vehicleType: string; manufactureYear: number; postalCode: number }
  /** Online quotes come from the web form: never a chat behind them. */
  conversation: null
}

export type SolicitudDetail = LeadDetail | CotizacionDetail

export interface UpdateSolicitudRequest {
  status?: SolicitudStatus
  notes?: string
}
