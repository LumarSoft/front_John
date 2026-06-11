import { useMutation } from '@tanstack/react-query'
import { cotizadorService } from '@/src/services/cotizador.service'
import type { CotizarVehiculoRequest, VehicleType } from '@/src/types/api/cotizador'

export function useCotizarVehiculo(vehicleType: VehicleType) {
  return useMutation({
    mutationFn: (data: CotizarVehiculoRequest) => cotizadorService.cotizar(vehicleType, data),
  })
}
