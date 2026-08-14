import { portalFetch } from './portal-client'

export interface Documento {
  codigo: string
  nombre: string
  url: string
}

// Fetches a policy's documents on demand. The API resolves them live from Triunfo.
export async function fetchPolizaDocumentos(polizaId: number): Promise<Documento[]> {
  const res = await portalFetch(`/clients/me/polizas/${polizaId}/documentos`)
  if (!res.ok) throw new Error('No se pudieron cargar los documentos')
  return res.json() as Promise<Documento[]>
}
