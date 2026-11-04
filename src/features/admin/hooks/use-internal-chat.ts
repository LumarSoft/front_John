import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { internalChatService } from '@/src/services/internal-chat.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/** My chats: the team first, then the direct ones by latest activity. */
export function useInternalChats(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.internalChats,
    queryFn: () => internalChatService.chats(token as string),
    enabled: !!token && enabled,
    refetchInterval: 10_000,
  })
}

/** Unread messages across my chats, for the menu badge and the new-message notice. */
export function useInternalChatUnread(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.internalChatUnread,
    queryFn: () => internalChatService.unread(token as string),
    enabled: !!token && enabled,
    refetchInterval: 15_000,
  })
}

/** Coworkers I can write to. */
export function useInternalChatPeople(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.internalChatPeople,
    queryFn: () => internalChatService.people(token as string),
    enabled: !!token && enabled,
  })
}

/**
 * The open chat, a page at a time: the first page is the latest messages (kept
 * fresh by polling), each next page goes further back.
 */
export function useInternalChatMessages(chatId: number | null) {
  const { token } = useAuth()
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.admin.internalChatMessages(chatId ?? 0),
    queryFn: ({ pageParam }) => internalChatService.messages(token as string, chatId as number, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: page => (page.hasMore ? page.messages[0]?.id : undefined),
    enabled: !!token && chatId !== null,
    refetchInterval: 4_000,
  })
}

export function useInternalChatActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refreshChat = (chatId: number) => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.internalChatMessages(chatId) })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.internalChats })
  }

  const openDirect = useMutation({
    mutationFn: (userId: number) => internalChatService.openDirect(token as string, userId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.internalChats }),
  })

  const send = useMutation({
    mutationFn: ({ chatId, body }: { chatId: number; body: string }) =>
      internalChatService.send(token as string, chatId, body),
    onSuccess: message => refreshChat(message.chatId),
  })

  const markRead = useMutation({
    mutationFn: ({ chatId, messageId }: { chatId: number; messageId: number }) =>
      internalChatService.markRead(token as string, chatId, messageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.internalChatUnread })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.internalChats })
    },
  })

  const removeMessage = useMutation({
    mutationFn: ({ messageId }: { chatId: number; messageId: number }) =>
      internalChatService.removeMessage(token as string, messageId),
    onSuccess: (_, { chatId }) => refreshChat(chatId),
  })

  return { openDirect, send, markRead, removeMessage }
}
