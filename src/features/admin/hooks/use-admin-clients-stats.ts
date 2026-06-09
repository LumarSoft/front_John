import { useQuery } from '@tanstack/react-query'
import { adminClientsService } from '@/src/services/admin-clients.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useAdminClientsStats() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.clientsStats,
    queryFn: () => adminClientsService.stats(token as string),
    enabled: !!token,
  })
}
