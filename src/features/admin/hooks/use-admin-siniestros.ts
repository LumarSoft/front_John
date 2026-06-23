import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminSiniestrosService, type AdminSiniestrosQuery } from '@/src/services/siniestros.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useAdminSiniestros(params: AdminSiniestrosQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.siniestros(params),
    queryFn: () => adminSiniestrosService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}
