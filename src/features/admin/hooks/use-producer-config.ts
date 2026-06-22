import { useQuery } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useProducerConfig() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.config,
    queryFn: () => adminConfigService.get(token as string),
    enabled: !!token,
  })
}
