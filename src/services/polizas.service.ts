import { getToken } from './portal-auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface Vehiculo {
  id: number
  dominio: string | null
  marca: string | null
  modelo: string | null
  subModelo: string | null
  anio: number | null
  tipo: string | null
  uso: string | null
  cobertura: string | null
  sumaAsegurada: string | null
  ceroKm: boolean
  chasis: string | null
  motor: string | null
}

export interface Cuota {
  id: number
  numeroCuota: number
  amount: string
  dueDate: string | null
  status: 'pending' | 'paid' | 'overdue'
}

export type RiskType = 'auto' | 'home' | 'life' | 'commercial' | 'other'

export interface PolizaListItem {
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
  createdAt: string
  vehiculo: Vehiculo | null
  cuotas: Cuota[]
}

export interface PolizaDetail extends PolizaListItem {
  cuotas: Cuota[]
}

// Returns the next pending/overdue cuota, or the last paid one if all are paid
export function proximaCuota(cuotas: Cuota[]): Cuota | null {
  if (!cuotas.length) return null
  const pending = cuotas.find(c => c.status === 'pending' || c.status === 'overdue')
  if (pending) return pending
  return cuotas[cuotas.length - 1] // last paid
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchPolizas(): Promise<PolizaListItem[]> {
  const res = await fetch(`${API_URL}/clients/me/polizas`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Error al cargar las pólizas')
  return res.json() as Promise<PolizaListItem[]>
}

export async function fetchPoliza(id: number): Promise<PolizaDetail> {
  const res = await fetch(`${API_URL}/clients/me/polizas/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Póliza no encontrada')
  return res.json() as Promise<PolizaDetail>
}
