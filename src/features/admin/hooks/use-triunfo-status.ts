import { useQuery } from '@tanstack/react-query'
import { triunfoService } from '@/src/services/triunfo.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

// An outage is announced by mail too; the banner only needs to catch up within minutes.
const REFRESH_MS = 5 * 60 * 1000

/** Whether Triunfo accepts the organization's credentials (the office's panel, not the OWNER's). */
export function useTriunfoStatus(enabled: boolean) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.triunfoStatus,
    queryFn: () => triunfoService.status(token as string),
    enabled: !!token && enabled,
    refetchInterval: REFRESH_MS,
  })
}
