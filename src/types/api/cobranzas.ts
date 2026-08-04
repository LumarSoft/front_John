import type { RiskType } from './clients'

export type CobranzaEstadoFilter = 'vencidas' | 'rechazadas' | 'pendientes' | 'todas'

export interface CobranzaCliente {
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string
  phone: string | null
  ramos: RiskType[]
  dominio: string | null
  pendingCount: number
  overdueCount: number
  rejectedCount: number
  paidCount: number
  totalDeuda: string
  oldestOverdueDate: string | null
}

export interface CobranzasPage {
  data: CobranzaCliente[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CobranzasStats {
  clientesConDeuda: number
  clientesVencidas: number
  clientesRechazadas: number
  clientesPendientes: number
  cuotasVencidas: number
  cuotasRechazadas: number
  cuotasPendientes: number
  montoDeudaTotal: string
}

export interface CobranzasQuery {
  search?: string
  estado?: CobranzaEstadoFilter
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
  page?: number
  pageSize?: number
}
