import { useQuery } from '@tanstack/react-query'
import { cobranzasService } from '@/src/services/cobranzas.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useCobranzasStats() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.cobranzasStats,
    queryFn: () => cobranzasService.stats(token as string),
    enabled: !!token,
  })
}
