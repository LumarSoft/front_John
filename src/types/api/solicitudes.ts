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
}

export interface CotizacionDetail {
  kind: 'cotizacion'
  id: number
  status: SolicitudStatus
  notes: string | null
  selectedCoverage: string
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
  cotizacion: { quoteNumber: number; vehicleType: string; manufactureYear: number; postalCode: number }
}

export type SolicitudDetail = LeadDetail | CotizacionDetail

export interface UpdateSolicitudRequest {
  status?: SolicitudStatus
  notes?: string
}
