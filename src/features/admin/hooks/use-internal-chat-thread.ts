import { useEffect, useRef, useState } from 'react'
import type { InternalChat, InternalChatMessage } from '@/src/types/api/internal-chat'
import { useInternalChatActions, useInternalChatMessages } from './use-internal-chat'

/**
 * The open chat: its messages oldest first, the unread divider as it was when
 * the chat opened, who has seen what, and the read mark kept up to date while
 * the chat is on screen.
 */
export function useInternalChatThread(chat: InternalChat, myId: number | undefined) {
  const query = useInternalChatMessages(chat.id)
  const { markRead } = useInternalChatActions()
  const markReadMutate = markRead.mutate
  const pages = query.data?.pages
  const members = pages?.[0]?.members ?? []

  // Pages come newest first; each page is oldest first.
  const byId = new Map<number, InternalChatMessage>()
  for (const page of [...(pages ?? [])].reverse()) for (const message of page.messages) byId.set(message.id, message)
  const messages = [...byId.values()]
  const last = messages[messages.length - 1] ?? null
  const myMark = members.find(member => member.user.id === myId)?.lastReadMessageId ?? 0

  // The first message I had not read when the chat opened: the divider stays
  // there during the visit even after the chat is marked read.
  const [firstUnreadId, setFirstUnreadId] = useState<number | null | undefined>(undefined)
  const firstUnreadNow = messages.find(message => message.id > myMark && message.sender.id !== myId)?.id ?? null
  useEffect(() => {
    if (firstUnreadId !== undefined || !pages || myId === undefined) return
    // A timer keeps the state update out of the effect body (react-hooks rule).
    const timer = setTimeout(() => setFirstUnreadId(firstUnreadNow), 0)
    return () => clearTimeout(timer)
  }, [firstUnreadId, pages, myId, firstUnreadNow])

  // Mark the chat read up to the newest message while the panel is in view.
  const requestedRef = useRef(0)
  const lastId = last?.id ?? 0
  useEffect(() => {
    const markIfVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (lastId <= myMark || lastId <= requestedRef.current) return
      requestedRef.current = lastId
      markReadMutate({ chatId: chat.id, messageId: lastId })
    }
    markIfVisible()
    document.addEventListener('visibilitychange', markIfVisible)
    return () => document.removeEventListener('visibilitychange', markIfVisible)
  }, [chat.id, lastId, myMark, markReadMutate])

  /** The others who have read up to that message ("Visto"). */
  const seenBy = (messageId: number) =>
    members.filter(member => member.user.id !== myId && (member.lastReadMessageId ?? 0) >= messageId)

  return {
    messages,
    last,
    firstUnreadId: firstUnreadId ?? null,
    ready: !!pages && firstUnreadId !== undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    hasOlder: query.hasNextPage,
    loadingOlder: query.isFetchingNextPage,
    loadOlder: () => void query.fetchNextPage(),
    seenBy,
  }
}
