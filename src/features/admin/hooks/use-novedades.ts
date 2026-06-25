import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { novedadesService } from '@/src/services/novedades.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { NovedadesQuery } from '@/src/types/api/novedades'
import { useAuth } from '../context/auth-context'

export function useNovedades(params: NovedadesQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.novedades(params),
    queryFn: () => novedadesService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}
