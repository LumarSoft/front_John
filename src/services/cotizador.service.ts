import type { CotizarAutoRequest, CotizarAutoResponse } from '@/src/types/api/cotizador'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const cotizadorService = {
  cotizarAuto: async (data: CotizarAutoRequest): Promise<CotizarAutoResponse> => {
    const res = await fetch(`${API_URL}/cotizador/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Cotizador error: ${res.status}`)
    return res.json() as Promise<CotizarAutoResponse>
  },
}
