import { useQuery } from '@tanstack/react-query'
import { infoAutoService } from '@/src/services/infoauto.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'

const infoAutoEnabled = process.env.NEXT_PUBLIC_INFOAUTO_ENABLED !== 'false'

export function useBrands(query?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.infoauto.brands(query),
    queryFn: () => infoAutoService.getBrands(query),
    enabled: infoAutoEnabled,
  })
}
