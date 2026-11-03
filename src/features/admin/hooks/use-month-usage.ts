import { useQuery } from '@tanstack/react-query'
import { billingService } from '@/src/services/billing.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'
import { summarizeMonth } from '../lib/month-usage'

/** The sidebar refreshes slower than Facturación, which follows every delivery. */
const SIDEBAR_REFRESH_MS = 60_000

/**
 * The running month of the user's numbers, for the sidebar. Shares Facturación's cache (same query), so opening that
 * screen refreshes it too.
 */
export function useMonthUsage(enabled: boolean) {
  const { token } = useAuth()
  const { data } = useQuery({
    queryKey: QUERY_KEYS.admin.billing(),
    queryFn: () => billingService.overview(token as string),
    enabled: !!token && enabled,
    refetchInterval: SIDEBAR_REFRESH_MS,
  })
  return data ? summarizeMonth(data) : null
}
