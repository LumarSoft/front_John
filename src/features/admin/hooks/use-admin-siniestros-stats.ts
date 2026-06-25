import { useQuery } from '@tanstack/react-query'
import { adminSiniestrosService } from '@/src/services/siniestros.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useAdminSiniestrosStats() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.siniestrosStats,
    queryFn: () => adminSiniestrosService.stats(token as string),
    enabled: !!token,
  })
}
