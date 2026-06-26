import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/src/services/users.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/** Org producer codes for the user-assignment UI (SuperAdmin only endpoint). */
export function useProducerCodes(enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.producerCodes,
    queryFn: () => usersService.listProducerCodes(token as string),
    enabled: !!token && enabled,
  })
}
