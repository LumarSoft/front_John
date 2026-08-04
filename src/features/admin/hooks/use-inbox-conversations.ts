import { useQuery } from '@tanstack/react-query'
import { inboxService } from '@/src/services/inbox.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ScopeFilterValue } from '../components/scope-filter'
import { useAuth } from '../context/auth-context'

export function useInboxConversations(status?: string, search?: string, scope?: ScopeFilterValue) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.inbox.conversations(status, search, scope),
    queryFn: () => inboxService.listConversations(token as string, status, search, scope),
    enabled: !!token,
    refetchInterval: 5_000,
  })
}
