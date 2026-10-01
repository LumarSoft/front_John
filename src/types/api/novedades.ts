export type NovedadType = 'siniestro' | 'handoff' | 'baja_poliza' | 'lead' | 'solicitud'

export interface NovedadClient {
  id: number
  firstName: string
  lastName: string
  dni: string
}

export type MatterCategory = 'baja' | 'pagos' | 'cotizacion' | 'siniestro' | 'documentos' | 'other'
export type MatterStatus = 'pending' | 'in_progress' | 'resolved'
export const MATTER_LABELS: Record<MatterCategory, string> = {
  baja: 'Bajas',
  pagos: 'Pagos y cobranza',
  cotizacion: 'Cotizaciones y contratación',
  siniestro: 'Siniestros',
  documentos: 'Documentación y cambios',
  other: 'Por clasificar',
}
export const MATTER_STATUS_LABELS: Record<MatterStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En atención',
  resolved: 'Resuelto',
}
export interface NovedadItem {
  category: MatterCategory
  status: MatterStatus
  resolvedAt: string | null
  id: number
  type: NovedadType
  refId: number
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
  client: NovedadClient | null
}

export interface NovedadesPage {
  data: NovedadItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface NovedadesStats {
  actionableTotal: number
  actionableByCategory: Record<MatterCategory, number>
  unreadTotal: number
  unreadSiniestros: number
  unreadHandoff: number
  unreadBajas: number
}

export interface NovedadesQuery {
  category?: MatterCategory
  status?: MatterStatus
  actionable?: boolean
  since?: string
  type?: NovedadType
  unread?: boolean
  search?: string
  clientId?: number
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
  page?: number
  pageSize?: number
}
