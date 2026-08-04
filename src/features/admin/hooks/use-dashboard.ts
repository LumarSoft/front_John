import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/src/services/dashboard.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ScopeFilterValue } from '../components/scope-filter'
import { useAuth } from '../context/auth-context'

export function useDashboard(scope?: ScopeFilterValue) {
  const { token } = useAuth()

  return useQuery({
    queryKey: [...QUERY_KEYS.admin.dashboard, scope ?? {}],
    queryFn: () => dashboardService.get(token as string, scope),
    enabled: !!token,
    // Override the global 5-min staleTime: the dashboard is a live snapshot, so it
    // refetches every time the admin navigates back to it.
    staleTime: 0,
  })
}
