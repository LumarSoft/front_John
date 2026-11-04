import type { ReactNode } from 'react'
import { Check, CheckCheck, ChevronDown, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { cn } from '@/src/lib/utils'
import type { InternalChatMessage } from '@/src/types/api/internal-chat'
import { messageTime } from '../lib/internal-chat-format'
import { personName } from '../lib/tasks-format'

const LINK = /(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g

/** The text with its links clickable. */
function linkify(text: string): ReactNode[] {
  return text.split(LINK).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noreferrer" className="break-all text-ember-2 underline">
        {part}
      </a>
    ) : (
      part
    ),
  )
}

interface InternalChatMessageBubbleProps {
  message: InternalChatMessage
  mine: boolean
  /** Show who wrote it (the first of a run in the team chat). */
  showSender: boolean
  /** Direct chats: whether the other person has read it. Undefined = no mark. */
  seen?: boolean
  onDelete?: () => void
}

export function InternalChatMessageBubble({
  message,
  mine,
  showSender,
  seen,
  onDelete,
}: InternalChatMessageBubbleProps) {
  return (
    <div data-message-id={message.id} className={cn('group flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative max-w-[min(80%,560px)] rounded-xl px-3 py-1.5 text-[14px] leading-[20px] shadow-xs',
          mine ? 'rounded-tr-sm bg-ember-soft text-ink' : 'rounded-tl-sm border border-line-2 bg-card text-ink',
        )}
      >
        {showSender && <p className="mb-0.5 text-[12.5px] font-semibold text-ember-2">{personName(message.sender)}</p>}
        <p className="whitespace-pre-wrap break-words">
          {linkify(message.body)}
          {/* Room for the time, so the last line never runs under it. */}
          <span className="inline-block w-14" aria-hidden />
        </p>
        <span className="absolute right-2 bottom-1 flex items-center gap-0.5 text-[10.5px] tabular-nums text-muted-foreground">
          {messageTime(message.createdAt)}
          {seen !== undefined &&
            (seen ? (
              <CheckCheck className="size-3.5 text-ember-2" aria-label="Visto" />
            ) : (
              <Check className="size-3.5" aria-label="Enviado" />
            ))}
        </span>
        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Opciones del mensaje"
              className="absolute top-1 right-1 rounded-full bg-ember-soft p-0.5 text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            >
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 /> Eliminar mensaje
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
