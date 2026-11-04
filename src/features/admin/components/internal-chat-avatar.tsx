import { Users } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { InternalChat } from '@/src/types/api/internal-chat'
import { personInitials } from '../lib/internal-chat-format'

/** The team's icon, or the other person's initials. */
export function InternalChatAvatar({
  chat,
  className,
}: {
  chat: Pick<InternalChat, 'kind' | 'person'>
  className?: string
}) {
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
        chat.kind === 'TEAM' ? 'bg-ember-soft text-ember-2' : 'bg-secondary text-ink-3',
        className,
      )}
    >
      {chat.kind === 'TEAM' ? <Users className="size-5" /> : chat.person ? personInitials(chat.person) : '?'}
    </span>
  )
}
