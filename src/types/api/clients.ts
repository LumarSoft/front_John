export type RiskType = 'auto' | 'home' | 'life' | 'commercial' | 'other'

export interface AdminVehiculo {
  id: number
  dominio: string | null
  marca: string | null
  modelo: string | null
  subModelo: string | null
  anio: number | null
  cobertura: string | null
  sumaAsegurada: string | null
}

export interface AdminVehiculoDetail extends AdminVehiculo {
  tipo: string | null
  uso: string | null
  ceroKm: boolean
  chasis: string | null
  motor: string | null
}

export interface AdminCuota {
  id: number
  numeroCuota: number
  amount: string
  dueDate: string | null
  status: 'pending' | 'paid' | 'overdue' | 'rejected'
}

export interface AdminPolizaSummary {
  id: number
  certificado: string
  riskType: RiskType
  status: string
  vigenciaDesde: string | null
  vigenciaHasta: string | null
  premio: string | null
  vehiculo: AdminVehiculo | null
}

export interface AdminPolizaDetail {
  id: number
  certificado: string
  suplemento: number
  company: string
  riskType: RiskType
  status: string
  vigenciaDesde: string | null
  vigenciaHasta: string | null
  premio: string | null
  paymentMethod: string | null
  vehiculo: AdminVehiculoDetail | null
  cuotas: AdminCuota[]
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
  email: string
  phone: string | null
  city: string | null
  dni: string
  createdAt: string
  polizas: AdminPolizaSummary[]
  cuotaStats: AdminCuotaStats
}

export interface AdminClientDetail {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string | null
  city: string | null
  dni: string
  createdAt: string
  polizas: AdminPolizaDetail[]
}

export type ClientEstadoFilter = 'vigente' | 'por_vencer' | 'vencida' | 'sin_polizas'

export type ClientSort = 'nombre_asc' | 'nombre_desc' | 'reciente'

export interface AdminClientsQuery {
  search?: string
  riskType?: RiskType
  estado?: ClientEstadoFilter
  sort?: ClientSort
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
  vigentes: number
  porVencer: number
  vencidas: number
  cuotasVencidas: number
}
