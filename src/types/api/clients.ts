export type RiskType = 'auto' | 'home' | 'life' | 'commercial' | 'other'

export interface AdminVehiculo {
  id: number
  licensePlate: string | null
  brand: string | null
  model: string | null
  version: string | null
  year: number | null
  coverage: string | null
  sumInsured: string | null
}

export interface AdminVehiculoDetail extends AdminVehiculo {
  type: string | null
  usage: string | null
  isZeroKm: boolean
  chassisNumber: string | null
  engineNumber: string | null
}

export interface AdminCuota {
  id: number
  number: number
  amount: string
  dueDate: string | null
  status: 'pending' | 'paid' | 'overdue' | 'rejected'
}

/**
 * Validity computed by the API from the dates and the Triunfo movement:
 * `movimiento` is the last movement ("REFACTURACION", "ANULA POR VENTA"…), not a
 * validity flag, and a cancelled policy keeps its original end date.
 */
export type EstadoVigencia = 'vigente' | 'proxima' | 'vencida' | 'anulada'

export interface AdminPolizaSummary {
  id: number
  certificateNumber: string
  riskType: RiskType
  lastMovement: string
  validityStatus: EstadoVigencia
  validFrom: string | null
  validTo: string | null
  premium: string | null
  vehicle: AdminVehiculo | null
}

export interface AdminPolizaDetail {
  id: number
  certificateNumber: string
  endorsementNumber: number
  company: string
  riskType: RiskType
  lastMovement: string
  validityStatus: EstadoVigencia
  validFrom: string | null
  validTo: string | null
  premium: string | null
  paymentMethod: string | null
  /** What the API calls a non-vehicle policy ("Acc. personales", "Sepelio"…); null for vehicles. */
  product?: string | null
  vehicle: AdminVehiculoDetail | null
  installments: AdminCuota[]
}

/** A document Triunfo has for a policy (tarjeta verde, certificado, constancia…). */
export interface AdminPolizaDocumento {
  code: string
  name: string
  url: string
}

export interface AdminCuotaStats {
  pending: number
  overdue: number
  rejected: number
  paid: number
}

export interface AdminClientSummary {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  city: string | null
  dni: string
  createdAt: string
  policies: AdminPolizaSummary[]
  installmentStats: AdminCuotaStats
}

export interface AdminClientDetail {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  city: string | null
  dni: string
  createdAt: string
  policies: AdminPolizaDetail[]
}

export type ClientEstadoFilter = 'vigente' | 'por_vencer' | 'vencida' | 'sin_polizas'

export type ClientSort = 'nombre_asc' | 'nombre_desc' | 'reciente'

export interface AdminClientsQuery {
  search?: string
  riskType?: RiskType
  status?: ClientEstadoFilter
  sort?: ClientSort
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
  page?: number
  pageSize?: number
}

export interface AdminClientsPage {
  data: AdminClientSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminClientsStats {
  totalClients: number
  inForce: number
  expiringSoon: number
  expired: number
  overdueInstallments: number
}
