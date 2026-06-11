import { useQuery } from '@tanstack/react-query'
import { infoAutoService } from '@/src/services/infoauto.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { VehicleType } from '@/src/types/api/cotizador'

const infoAutoEnabled = process.env.NEXT_PUBLIC_INFOAUTO_ENABLED !== 'false'

export function useModels(vehicleType: VehicleType, brandId: number | null, groupId: number | null, query?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.infoauto.models(vehicleType, brandId ?? 0, groupId ?? 0, query),
    queryFn: () => infoAutoService.getModels(vehicleType, brandId!, groupId!, query),
    enabled: infoAutoEnabled && brandId !== null && groupId !== null,
  })
}
