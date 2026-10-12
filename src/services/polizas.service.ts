import { portalFetch } from './portal-client'
import type { EstadoVigencia } from '@/src/types/api/clients'

export interface Vehiculo {
  id: number
  licensePlate: string | null
  brand: string | null
  model: string | null
  version: string | null
  year: number | null
  type: string | null
  usage: string | null
  coverage: string | null
  sumInsured: string | null
  isZeroKm: boolean
  chassisNumber: string | null
  engineNumber: string | null
}

export interface Cuota {
  id: number
  number: number
  amount: string
  dueDate: string | null
  status: 'pending' | 'paid' | 'overdue'
}

export type RiskType = 'auto' | 'moto' | 'home' | 'life' | 'commercial' | 'other'

// Non-vehicle policies expose coverage details extracted from rawData.SDTOtrosRiesgosDatos
export interface BienCobertura {
  risk: string
  coverage: string
  sumInsured: string
}

export interface BienData {
  description: string | null
  coverages: BienCobertura[]
}

export interface PolizaListItem {
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
  createdAt: string
  vehicle: Vehiculo | null
  installments: Cuota[]
  insuredItem: BienData | null
}

export interface PolizaDetail extends PolizaListItem {
  installments: Cuota[]
}

// Returns the next pending/overdue cuota, or the last paid one if all are paid
export function proximaCuota(cuotas: Cuota[]): Cuota | null {
  if (!cuotas.length) return null
  const pending = cuotas.find(c => c.status === 'pending' || c.status === 'overdue')
  if (pending) return pending
  return cuotas[cuotas.length - 1] // last paid
}

export async function fetchPolizas(): Promise<PolizaListItem[]> {
  const res = await portalFetch('/clients/me/polizas')
  if (!res.ok) throw new Error('Error al cargar las pólizas')
  return res.json() as Promise<PolizaListItem[]>
}

export async function fetchPoliza(id: number): Promise<PolizaDetail> {
  const res = await portalFetch(`/clients/me/polizas/${id}`)
  if (!res.ok) throw new Error('Póliza no encontrada')
  return res.json() as Promise<PolizaDetail>
}
