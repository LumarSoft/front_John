import { useQuery } from '@tanstack/react-query'
import { inboxService } from '@/src/services/inbox.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useInboxConversations(status?: string, search?: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.inbox.conversations(status, search),
    queryFn: () => inboxService.listConversations(token as string, status, search),
    enabled: !!token,
    refetchInterval: 5_000,
  })
}
