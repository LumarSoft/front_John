import { getToken } from './portal-auth.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface Documento {
  codigo: string
  nombre: string
  url: string
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Fetches a policy's documents on demand. The API resolves them live from Triunfo.
export async function fetchPolizaDocumentos(polizaId: number): Promise<Documento[]> {
  const res = await fetch(`${API_URL}/clients/me/polizas/${polizaId}/documentos`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('No se pudieron cargar los documentos')
  return res.json() as Promise<Documento[]>
}
