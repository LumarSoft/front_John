import { useQuery } from '@tanstack/react-query'
import { novedadesService } from '@/src/services/novedades.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useNovedadesStats() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.novedadesStats,
    queryFn: () => novedadesService.stats(token as string),
    enabled: !!token,
  })
}
