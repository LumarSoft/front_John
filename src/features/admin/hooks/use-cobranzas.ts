import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cobranzasService } from '@/src/services/cobranzas.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CobranzasQuery } from '@/src/types/api/cobranzas'
import { useAuth } from '../context/auth-context'

export function useCobranzas(params: CobranzasQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.cobranzas(params),
    queryFn: () => cobranzasService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}
