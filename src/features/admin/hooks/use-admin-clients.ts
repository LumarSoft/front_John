import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminClientsService } from '@/src/services/admin-clients.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { AdminClientsQuery } from '@/src/types/api/clients'
import { useAuth } from '../context/auth-context'

export function useAdminClients(params: AdminClientsQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.clients(params),
    queryFn: () => adminClientsService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}
