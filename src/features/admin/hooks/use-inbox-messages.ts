import { useQuery } from '@tanstack/react-query'
import { inboxService } from '@/src/services/inbox.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useInboxMessages(conversationId: number | null) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.inbox.messages(conversationId ?? 0),
    queryFn: () => inboxService.getMessages(conversationId as number, token as string),
    enabled: !!token && conversationId !== null,
    refetchInterval: 3_000,
  })
}
