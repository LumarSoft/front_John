import { Fragment } from 'react'
import { ArrowDown, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { InternalChat } from '@/src/types/api/internal-chat'
import { useInternalChatActions } from '../hooks/use-internal-chat'
import { useInternalChatScroll } from '../hooks/use-internal-chat-scroll'
import { useInternalChatThread } from '../hooks/use-internal-chat-thread'
import { chatTitle, dayLabel, joinNames, messageDay } from '../lib/internal-chat-format'
import { personName } from '../lib/tasks-format'
import { InternalChatAvatar } from './internal-chat-avatar'
import { InternalChatComposer } from './internal-chat-composer'
import { InternalChatMessageBubble } from './internal-chat-message-bubble'

interface InternalChatThreadProps {
  chat: InternalChat
  myId: number | undefined
  /** Everyone in the office, me included, for the team chat's header. */
  teamSize: number
  onBack: () => void
}

export function InternalChatThread({ chat, myId, teamSize, onBack }: InternalChatThreadProps) {
  const thread = useInternalChatThread(chat, myId)
  const { send, removeMessage } = useInternalChatActions()
  const { messages, last } = thread
  const { containerRef, anchorRef, onScroll, atBottom, hasNew, scrollToBottom, keepPosition } = useInternalChatScroll({
    firstId: messages[0]?.id ?? null,
    lastId: last?.id ?? null,
    lastIsMine: last?.sender.id === myId,
    ready: thread.ready,
  })
  const isTeam = chat.kind === 'TEAM'
  const subtitle = isTeam
    ? `${teamSize} ${teamSize === 1 ? 'persona' : 'personas'} · lo ve todo el equipo`
    : `Solo vos y ${chatTitle(chat)} ven este chat`
  // In the team chat, who has seen my latest message.
  const myLast = [...messages].reverse().find(message => message.sender.id === myId)
  const seenMyLast = isTeam && myLast ? thread.seenBy(myLast.id).map(member => personName(member.user)) : []

  const handleSend = async (body: string): Promise<boolean> => {
    try {
      await send.mutateAsync({ chatId: chat.id, body })
      return true
    } catch {
      toast.error('No se pudo enviar el mensaje')
      return false
    }
  }

  const handleDelete = (messageId: number) => {
    removeMessage.mutate(
      { chatId: chat.id, messageId },
      { onError: () => toast.error('No se pudo eliminar el mensaje') },
    )
  }

  const loadOlder = () => {
    keepPosition()
    thread.loadOlder()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line-2 px-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a los chats"
          className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary md:hidden"
        >
          <ArrowLeft className="size-5" />
        </button>
        <InternalChatAvatar chat={chat} />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-ink">{chatTitle(chat)}</h2>
          <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="h-full overflow-y-auto bg-secondary/30 px-3 py-3 sm:px-6"
        >
          {thread.isError ? (
            <p role="alert" className="py-10 text-center text-[13px] text-destructive">
              No se pudieron cargar los mensajes.
            </p>
          ) : thread.isLoading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-[13px] text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando mensajes…
            </p>
          ) : messages.length === 0 ? (
            <div className="mx-auto mt-10 max-w-sm rounded-xl border border-line-2 bg-card px-5 py-4 text-center">
              <p className="text-[14px] font-medium text-ink">Todavía no hay mensajes</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {isTeam
                  ? 'Lo que escribas acá lo lee todo el equipo. No llega a WhatsApp.'
                  : `Lo que escribas acá lo lee solo ${chatTitle(chat)}. No llega a WhatsApp.`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {thread.hasOlder && (
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={thread.loadingOlder}
                  className="mx-auto mb-2 flex items-center gap-1.5 rounded-full border border-line-2 bg-card px-3 py-1 text-[12.5px] text-ink-3 hover:bg-secondary disabled:opacity-60"
                >
                  {thread.loadingOlder && <Loader2 className="size-3.5 animate-spin" />}
                  Ver mensajes anteriores
                </button>
              )}
              {messages.map((message, index) => {
                const previous = messages[index - 1]
                const mine = message.sender.id === myId
                const newDay = !previous || messageDay(previous.createdAt) !== messageDay(message.createdAt)
                const newRun = newDay || previous?.sender.id !== message.sender.id
                const direct = !isTeam && mine
                return (
                  <Fragment key={message.id}>
                    {newDay && (
                      <div className="my-2 flex justify-center">
                        <span className="rounded-md bg-card px-2.5 py-1 text-[11.5px] text-muted-foreground shadow-xs first-letter:uppercase">
                          {dayLabel(messageDay(message.createdAt))}
                        </span>
                      </div>
                    )}
                    {message.id === thread.firstUnreadId && (
                      <div ref={anchorRef} className="my-2 flex justify-center">
                        <span className="rounded-full bg-ember-soft px-3 py-1 text-[11.5px] font-medium text-ember-2">
                          Mensajes sin leer
                        </span>
                      </div>
                    )}
                    <div className={newRun && index > 0 ? 'mt-1.5' : undefined}>
                      <InternalChatMessageBubble
                        message={message}
                        mine={mine}
                        showSender={isTeam && !mine && newRun}
                        seen={direct ? thread.seenBy(message.id).length > 0 : undefined}
                        onDelete={mine ? () => handleDelete(message.id) : undefined}
                      />
                    </div>
                  </Fragment>
                )
              })}
              {seenMyLast.length > 0 && myLast?.id === last?.id && (
                <p className="mt-0.5 text-right text-[11.5px] text-muted-foreground">
                  Visto por {joinNames(seenMyLast)}
                </p>
              )}
            </div>
          )}
        </div>

        {!atBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            aria-label="Ir al último mensaje"
            className="absolute right-4 bottom-3 flex items-center gap-1.5 rounded-full border border-line-2 bg-card px-3 py-1.5 text-[12.5px] text-ink-3 shadow-md hover:bg-secondary"
          >
            {hasNew && <span className="font-medium text-ember-2">Mensajes nuevos</span>}
            <ArrowDown className="size-4" />
          </button>
        )}
      </div>

      <InternalChatComposer
        placeholder={isTeam ? 'Escribile al equipo' : `Escribile a ${chatTitle(chat)}`}
        sending={send.isPending}
        onSend={handleSend}
      />
    </div>
  )
}
