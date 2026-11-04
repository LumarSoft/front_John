import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { InternalChatUnread } from '@/src/types/api/internal-chat'
import { INTERNAL_CHAT_PATH, internalChatHref } from '../lib/internal-chat-format'
import { personName } from '../lib/tasks-format'

const PREVIEW_LENGTH = 120

/**
 * Shows a notice when a coworker writes in the internal chat while the person
 * is elsewhere in the panel. The first answer only sets the baseline, so
 * opening the panel does not replay what was already unread (the menu badge
 * shows it).
 */
export function useInternalChatNotifier(unread: InternalChatUnread | undefined) {
  const router = useRouter()
  const pathname = usePathname()
  const lastNotifiedRef = useRef<number | null>(null)

  useEffect(() => {
    if (!unread) return
    const latest = unread.latest
    const previous = lastNotifiedRef.current
    lastNotifiedRef.current = Math.max(previous ?? 0, latest?.id ?? 0)
    if (previous === null || !latest || latest.id <= previous) return
    // The chat itself shows the new message and its count.
    if (pathname === INTERNAL_CHAT_PATH) return

    const body = latest.body.length > PREVIEW_LENGTH ? `${latest.body.slice(0, PREVIEW_LENGTH)}…` : latest.body
    toast(`${personName(latest.sender)} te escribió en el chat interno`, {
      id: 'internal-chat-message',
      description: body,
      action: { label: 'Ver', onClick: () => router.push(internalChatHref(latest.chatId)) },
    })
  }, [unread, pathname, router])
}
