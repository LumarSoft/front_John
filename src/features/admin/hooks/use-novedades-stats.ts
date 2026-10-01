import { useQuery } from '@tanstack/react-query'
import { novedadesService } from '@/src/services/novedades.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useNovedadesStats(scope: { producerCodeId?: number; phoneNumberId?: number } = {}) {
  const { token } = useAuth()

  return useQuery({
    queryKey: [...QUERY_KEYS.admin.novedadesStats, scope],
    queryFn: () => novedadesService.stats(token as string, scope),
    enabled: !!token,
    // Poll so the sidebar alert appears even while the admin is on another section.
    refetchInterval: 20_000,
  })
}
