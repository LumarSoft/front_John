import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inboxService } from '@/src/services/inbox.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useInboxActions(conversationId: number | null) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'inbox'] })
  }

  const takeover = useMutation({
    mutationFn: () => inboxService.takeover(conversationId as number, token as string),
    onSuccess: invalidate,
  })

  const release = useMutation({
    mutationFn: () => inboxService.release(conversationId as number, token as string),
    onSuccess: invalidate,
  })

  const sendMessage = useMutation({
    mutationFn: (text: string) => inboxService.sendMessage(conversationId as number, text, token as string),
    onSuccess: () => {
      if (conversationId !== null) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.inbox.messages(conversationId),
        })
      }
    },
  })

  return { takeover, release, sendMessage }
}
