import { useQuery } from '@tanstack/react-query'
import { statusService } from '@/src/services/status.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/**
 * How the external services are answering, for the SuperAdmin and the OWNER (the
 * API refuses the rest). The section refreshes every minute; the menu badge, every 5.
 */
export function useIntegrationStatus({
  refreshMs = 60_000,
  enabled = true,
}: { refreshMs?: number; enabled?: boolean } = {}) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.status,
    queryFn: () => statusService.overview(token as string),
    enabled: !!token && enabled,
    refetchInterval: refreshMs,
  })
}
