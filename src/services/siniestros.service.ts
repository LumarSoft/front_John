import { getToken } from './portal-auth.service'
import type { RiskType } from './polizas.service'

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
