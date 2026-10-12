import { apiRequest } from '@/src/lib/api-client'
import { portalFetch } from './portal-client'
import type { RiskType } from './polizas.service'
// Admin panel UI helpers (RISK_LABELS / RiskIcon) are keyed by this narrower RiskType.
import type { RiskType as AdminRiskType } from '@/src/types/api/clients'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const SINIESTRO_TIPOS = ['auto', 'hogar', 'robo', 'otro'] as const
export type SiniestroTipo = (typeof SINIESTRO_TIPOS)[number]

export const SINIESTRO_ESTADOS = ['pending', 'in_progress', 'resolved'] as const
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
  certificateNumber: string
  company: string
  riskType: RiskType
}

export interface Siniestro {
  id: number
  type: SiniestroTipo
  description: string
  /** When the incident happened (ISO). */
  occurredAt: string
  status: SiniestroEstado
  attachments: Adjunto[] | null
  createdAt: string
  updatedAt: string
  policy: SiniestroPoliza
}

export interface CreateSiniestroInput {
  policyId: number
  type: SiniestroTipo
  description: string
  occurredAt: string
  attachments: File[]
}

// Resolves a stored attachment URL (which is API-relative) to an absolute URL.
export function adjuntoUrl(adjunto: Adjunto): string {
  return adjunto.url.startsWith('http') ? adjunto.url : `${API_URL}${adjunto.url}`
}

export async function fetchSiniestros(): Promise<Siniestro[]> {
  const res = await portalFetch('/clients/me/siniestros')
  if (!res.ok) throw new Error('Error al cargar los siniestros')
  return res.json() as Promise<Siniestro[]>
}

export async function fetchSiniestro(id: number): Promise<Siniestro> {
  const res = await portalFetch(`/clients/me/siniestros/${id}`)
  if (!res.ok) throw new Error('Siniestro no encontrado')
  return res.json() as Promise<Siniestro>
}

export async function createSiniestro(input: CreateSiniestroInput): Promise<Siniestro> {
  const form = new FormData()
  form.append('policyId', String(input.policyId))
  form.append('type', input.type)
  form.append('description', input.description)
  form.append('occurredAt', input.occurredAt)
  // The upload field keeps its name: it is how the API receives the files.
  for (const file of input.attachments) {
    form.append('adjuntos', file)
  }

  // Note: do NOT set Content-Type — the browser sets the multipart boundary.
  const res = await portalFetch('/clients/me/siniestros', {
    method: 'POST',
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
  licensePlate: string | null
  brand: string | null
  model: string | null
}

export interface AdminSiniestroDetail {
  id: number
  type: SiniestroTipo
  description: string
  occurredAt: string
  status: SiniestroEstado
  insurerClaimNumber: string | null
  attachments: Adjunto[] | null
  createdAt: string
  updatedAt: string
  client: {
    id: number
    firstName: string
    lastName: string
    dni: string
    email: string | null
    phone: string | null
  }
  policy: {
    id: number
    certificateNumber: string
    company: string
    riskType: AdminRiskType
    vehicle: AdminSiniestroVehiculo | null
  }
}

export interface UpdateSiniestroInput {
  status?: SiniestroEstado
  insurerClaimNumber?: string
}

export type SiniestroEstadoFilter = SiniestroEstado | 'todos'

export interface AdminSiniestrosQuery {
  status?: SiniestroEstado
  search?: string
  // SuperAdmin section filter: by producer code OR by phone number/sucursal.
  producerCodeId?: number
  phoneNumberId?: number
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
  pending: number
  inProgress: number
  resolved: number
  withoutInsurerNumber: number
}

function buildSiniestrosQuery(params: AdminSiniestrosQuery): string {
  const sp = new URLSearchParams()
  if (params.status) sp.set('status', params.status)
  if (params.search?.trim()) sp.set('search', params.search.trim())
  if (params.producerCodeId) sp.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) sp.set('phoneNumberId', String(params.phoneNumberId))
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
