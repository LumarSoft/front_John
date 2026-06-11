import type {
  CotizarVehiculoRequest,
  CotizarVehiculoResponse,
  SolicitarCoberturaRequest,
  SolicitarCoberturaResponse,
  VehicleType,
} from '@/src/types/api/cotizador'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const cotizadorService = {
  cotizar: async (vehicleType: VehicleType, data: CotizarVehiculoRequest): Promise<CotizarVehiculoResponse> => {
    const res = await fetch(`${API_URL}/cotizador/${vehicleType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Cotizador error: ${res.status}`)
    return res.json() as Promise<CotizarVehiculoResponse>
  },

  solicitarCobertura: async (
    vehicleType: VehicleType,
    quoteNumber: string,
    data: SolicitarCoberturaRequest,
  ): Promise<SolicitarCoberturaResponse> => {
    const res = await fetch(`${API_URL}/cotizador/${vehicleType}/${quoteNumber}/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Cotizador error: ${res.status}`)
    return res.json() as Promise<SolicitarCoberturaResponse>
  },
}
