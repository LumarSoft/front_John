import { useMutation } from '@tanstack/react-query'
import { cotizadorService } from '@/src/services/cotizador.service'
import type { SolicitarCoberturaRequest, VehicleType } from '@/src/types/api/cotizador'

interface SolicitarCoberturaVariables {
  quoteNumber: string
  data: SolicitarCoberturaRequest
}

export function useSolicitarCobertura(vehicleType: VehicleType) {
  return useMutation({
    mutationFn: ({ quoteNumber, data }: SolicitarCoberturaVariables) =>
      cotizadorService.solicitarCobertura(vehicleType, quoteNumber, data),
  })
}
