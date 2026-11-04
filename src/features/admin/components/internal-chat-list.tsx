import { Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { InternalChat, InternalChatPerson } from '@/src/types/api/internal-chat'
import { chatTitle, listTime } from '../lib/internal-chat-format'
import { personName } from '../lib/tasks-format'
import { InternalChatAvatar } from './internal-chat-avatar'

interface InternalChatListProps {
  chats: InternalChat[]
  /** Coworkers without a direct chat yet. */
  people: InternalChatPerson[]
  selectedId: number | null
  myId: number | undefined
  startingId: number | null
  onSelect: (chatId: number) => void
  onStart: (personId: number) => void
}

function preview(chat: InternalChat, myId: number | undefined): string {
  const message = chat.lastMessage
  if (!message) return chat.kind === 'TEAM' ? 'Escribile a todo el equipo' : 'Todavía no hay mensajes'
  if (message.sender.id === myId) return `Vos: ${message.body}`
  return chat.kind === 'TEAM' ? `${personName(message.sender)}: ${message.body}` : message.body
}

const rowClasses = 'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/60'

export function InternalChatList({
  chats,
  people,
  selectedId,
  myId,
  startingId,
  onSelect,
  onStart,
}: InternalChatListProps) {
  return (
    <ul className="py-1">
      {chats.map(chat => (
        <li key={chat.id}>
          <button
            type="button"
            onClick={() => onSelect(chat.id)}
            aria-current={chat.id === selectedId}
            className={cn(rowClasses, chat.id === selectedId && 'bg-ember-soft hover:bg-ember-soft')}
          >
            <InternalChatAvatar chat={chat} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-[14px] font-medium text-ink">{chatTitle(chat)}</span>
                {chat.lastMessage && (
                  <span
                    className={cn(
                      'ml-auto shrink-0 text-[11.5px] tabular-nums',
                      chat.unread > 0 ? 'font-semibold text-ember-2' : 'text-muted-foreground',
                    )}
                  >
                    {listTime(chat.lastMessage.createdAt)}
                  </span>
                )}
              </span>
              <span className="mt-0.5 flex items-center gap-2">
                <span
                  className={cn(
                    'truncate text-[13px]',
                    chat.unread > 0 ? 'font-medium text-ink-3' : 'text-muted-foreground',
                  )}
                >
                  {preview(chat, myId)}
                </span>
                {chat.unread > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-ember-2 px-1.5 text-[11px] font-semibold tabular-nums text-on-ember">
                    {chat.unread}
                  </span>
                )}
              </span>
            </span>
          </button>
        </li>
      ))}

      {people.length > 0 && (
        <li className="px-4 pb-1 pt-4 text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          Empezar un chat
        </li>
      )}
      {people.map(person => (
        <li key={`person-${person.id}`}>
          <button
            type="button"
            onClick={() => onStart(person.id)}
            disabled={startingId !== null}
            className={cn(rowClasses, 'disabled:cursor-wait')}
          >
            <InternalChatAvatar chat={{ kind: 'DIRECT', person }} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-ink">{personName(person)}</span>
              <span className="block truncate text-[13px] text-muted-foreground">Escribile a {personName(person)}</span>
            </span>
            {startingId === person.id && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </button>
        </li>
      ))}
    </ul>
  )
}
