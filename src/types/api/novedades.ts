/**
 * `plan`: a number moved up a plan, or passed the largest one (refId = the number).
 * `triunfo`: Triunfo refuses the organization's credentials; resolved on its own when they work again.
 */
export type NovedadType = 'siniestro' | 'handoff' | 'baja_poliza' | 'lead' | 'solicitud' | 'plan' | 'triunfo'

export interface NovedadClient {
  id: number
  firstName: string
  lastName: string
  dni: string
}

/** Why the bot refused to file a claim and sent it to the office ("denuncia frenada"). */
export type BlockedClaimReason = 'NO_POLICY' | 'REJECTED_PAYMENT' | 'OVERDUE_INSTALLMENTS'
export const BLOCKED_CLAIM_LABELS: Record<BlockedClaimReason, string> = {
  NO_POLICY: 'Denuncia frenada: sin póliza vigente',
  REJECTED_PAYMENT: 'Denuncia frenada: pago rechazado',
  OVERDUE_INSTALLMENTS: 'Denuncia frenada: cuotas vencidas',
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
  /** Set on a claim the bot refused to file (absent on older APIs). */
  blockedClaimReason?: BlockedClaimReason | null
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
  unreadClaims: number
  unreadHandoff: number
  unreadCancellations: number
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
