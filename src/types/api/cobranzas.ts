import type { RiskType } from './clients'

export type CobranzaEstadoFilter = 'vencidas' | 'rechazadas' | 'pendientes' | 'todas'

export interface CobranzaCliente {
  id: number
  firstName: string
  lastName: string
  dni: string
  email: string | null
  phone: string | null
  riskTypes: RiskType[]
  licensePlate: string | null
  pendingCount: number
  overdueCount: number
  rejectedCount: number
  paidCount: number
  totalDebt: string
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
  clientsWithDebt: number
  clientsWithOverdue: number
  clientsWithRejected: number
  clientsWithPending: number
  overdueInstallments: number
  rejectedInstallments: number
  pendingInstallments: number
  totalDebt: string
}

export interface CobranzasQuery {
  search?: string
  status?: CobranzaEstadoFilter
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
  page?: number
  pageSize?: number
}
