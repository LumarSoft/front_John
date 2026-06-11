import { useQuery } from '@tanstack/react-query'
import { infoAutoService } from '@/src/services/infoauto.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { VehicleType } from '@/src/types/api/cotizador'

const infoAutoEnabled = process.env.NEXT_PUBLIC_INFOAUTO_ENABLED !== 'false'

export function useBrands(vehicleType: VehicleType, query?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.infoauto.brands(vehicleType, query),
    queryFn: () => infoAutoService.getBrands(vehicleType, query),
    enabled: infoAutoEnabled,
  })
}
