import { useMutation } from '@tanstack/react-query'
import { cotizadorService } from '@/src/services/cotizador.service'
import type { CotizarAutoRequest } from '@/src/types/api/cotizador'

export function useCotizarAuto() {
  return useMutation({
    mutationFn: (data: CotizarAutoRequest) => cotizadorService.cotizarAuto(data),
  })
}
