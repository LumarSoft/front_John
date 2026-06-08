import { useQuery } from '@tanstack/react-query'
import { infoAutoService } from '@/src/services/infoauto.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'

const infoAutoEnabled = process.env.NEXT_PUBLIC_INFOAUTO_ENABLED !== 'false'

export function useGroups(brandId: number | null, query?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.infoauto.groups(brandId ?? 0, query),
    queryFn: () => infoAutoService.getGroups(brandId!, query),
    enabled: infoAutoEnabled && brandId !== null,
  })
}
