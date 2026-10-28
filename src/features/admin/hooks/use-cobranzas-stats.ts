import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cobranzasService } from '@/src/services/cobranzas.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CobranzasScopeQuery } from '@/src/types/api/cobranzas'
import { useAuth } from '../context/auth-context'

/** The KPIs and segment counts of the cobranzas screen, for the same scope as its list. */
export function useCobranzasStats(params: CobranzasScopeQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.cobranzasStats(params),
    queryFn: () => cobranzasService.stats(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}
