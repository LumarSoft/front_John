import { apiRequest } from '@/src/lib/api-client'
import { getToken } from './portal-auth.service'
import type { RiskType } from './polizas.service'
// Admin panel UI helpers (RISK_LABELS / RiskIcon) are keyed by this narrower RiskType.
import type { RiskType as AdminRiskType } from '@/src/types/api/clients'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const SINIESTRO_TIPOS = ['auto', 'hogar', 'robo', 'otro'] as const
export type SiniestroTipo = (typeof SINIESTRO_TIPOS)[number]

export const SINIESTRO_ESTADOS = ['pendiente', 'en_proceso', 'resuelto'] as const
export type SiniestroEstado = (typeof SINIESTRO_ESTADOS)[number]

export interface Adjunto {
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
}

export interface SiniestroPoliza {
  id: number
  certificado: string
  company: string
  riskType: RiskType
}

export interface Siniestro {
  id: number
  tipo: SiniestroTipo
  descripcion: string
  fecha: string
  estado: SiniestroEstado
  adjuntos: Adjunto[] | null
  createdAt: string
  updatedAt: string
  poliza: SiniestroPoliza
}

export interface CreateSiniestroInput {
  polizaId: number
  tipo: SiniestroTipo
  descripcion: string
  fecha: string
  adjuntos: File[]
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Resolves a stored attachment URL (which is API-relative) to an absolute URL.
export function adjuntoUrl(adjunto: Adjunto): string {
  return adjunto.url.startsWith('http') ? adjunto.url : `${API_URL}${adjunto.url}`
}

export async function fetchSiniestros(): Promise<Siniestro[]> {
  const res = await fetch(`${API_URL}/clients/me/siniestros`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Error al cargar los siniestros')
  return res.json() as Promise<Siniestro[]>
}

export async function fetchSiniestro(id: number): Promise<Siniestro> {
  const res = await fetch(`${API_URL}/clients/me/siniestros/${id}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Siniestro no encontrado')
  return res.json() as Promise<Siniestro>
}

export async function createSiniestro(input: CreateSiniestroInput): Promise<Siniestro> {
  const form = new FormData()
  form.append('polizaId', String(input.polizaId))
  form.append('tipo', input.tipo)
  form.append('descripcion', input.descripcion)
  form.append('fecha', input.fecha)
  for (const file of input.adjuntos) {
    form.append('adjuntos', file)
  }

  // Note: do NOT set Content-Type — the browser sets the multipart boundary.
  const res = await fetch(`${API_URL}/clients/me/siniestros`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as { message?: string | string[] }
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message
    throw new Error(message ?? 'No se pudo registrar el siniestro')
  }

  return res.json() as Promise<Siniestro>
}

// ─── Admin (panel) ───────────────────────────────────────
// Uses the admin JWT (passed explicitly), unlike the client-portal calls above
// which rely on the portal token.

export interface AdminSiniestroVehiculo {
  dominio: string | null
  marca: string | null
  modelo: string | null
}

export interface AdminSiniestroDetail {
  id: number
  tipo: SiniestroTipo
  descripcion: string
  fecha: string
  estado: SiniestroEstado
  nroSiniestroCompania: string | null
  adjuntos: Adjunto[] | null
  createdAt: string
  updatedAt: string
  client: {
    id: number
    firstName: string
    lastName: string
    dni: string
    email: string
    phone: string | null
  }
  poliza: {
    id: number
    certificado: string
    company: string
    riskType: AdminRiskType
    vehiculo: AdminSiniestroVehiculo | null
  }
}

export interface UpdateSiniestroInput {
  estado?: SiniestroEstado
  nroSiniestroCompania?: string
}

export type SiniestroEstadoFilter = SiniestroEstado | 'todos'

export interface AdminSiniestrosQuery {
  estado?: SiniestroEstado
  search?: string
  page?: number
  pageSize?: number
}

export interface AdminSiniestrosPage {
  data: AdminSiniestroDetail[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminSiniestrosStats {
  pendientes: number
  enProceso: number
  resueltos: number
  sinNroCompania: number
}

function buildSiniestrosQuery(params: AdminSiniestrosQuery): string {
  const sp = new URLSearchParams()
  if (params.estado) sp.set('estado', params.estado)
  if (params.search?.trim()) sp.set('search', params.search.trim())
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export const adminSiniestrosService = {
  list: (params: AdminSiniestrosQuery, token: string) =>
    apiRequest<AdminSiniestrosPage>(`/admin/siniestros${buildSiniestrosQuery(params)}`, { token }),
  stats: (token: string) => apiRequest<AdminSiniestrosStats>('/admin/siniestros/stats', { token }),
  get: (id: number, token: string) => apiRequest<AdminSiniestroDetail>(`/admin/siniestros/${id}`, { token }),
  update: (id: number, input: UpdateSiniestroInput, token: string) =>
    apiRequest<AdminSiniestroDetail>(`/admin/siniestros/${id}`, { method: 'PATCH', token, body: input }),
}
