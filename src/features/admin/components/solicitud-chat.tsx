'use client'

import { Fragment, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ClipboardList, Loader2, MessageSquareOff } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import type { InboxMessage } from '@/src/types/api/inbox'
import type { SolicitudConversation, SolicitudDetail, SolicitudKind } from '@/src/types/api/solicitudes'
import { useSolicitudMessages } from '../hooks/use-solicitudes'
import { isSameDay, messageTime } from '../lib/inbox-format'
import { inboxConversationHref } from './inbox-view'
import { DayDivider, InboxMessageBubble, InboxNotice } from './inbox-message-bubble'

const CHAT_STATUS_LABEL: Record<SolicitudConversation['status'], string> = {
  open: 'Atendido por el bot',
  pending: 'Esperando a la oficina',
  closed: 'Chat cerrado',
}

const RETENTION_NOTE = 'se borran a los 30 días'

/** Index of the first message sent after the solicitud was created (= messages.length when none). */
function createdIndex(messages: InboxMessage[], createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const index = messages.findIndex(m => new Date(m.createdAt).getTime() > created)
  return index === -1 ? messages.length : index
}

interface Props {
  data: SolicitudDetail
  /** Messages are only polled while the tab is visible. */
  active: boolean
}

/**
 * The "Chat" tab of a solicitud: the WhatsApp conversation the request came
 * from, read-only, so the office can see how the customer got there without
 * leaving the solicitud. Replies happen in the Whatsapp section.
 */
export function SolicitudChat({ data, active }: Readonly<Props>) {
  if (!data.conversation) return <NoChat data={data} />
  return (
    <ChatThread
      conversation={data.conversation}
      kind={data.kind}
      id={data.id}
      createdAt={data.createdAt}
      active={active}
    />
  )
}

function NoChat({ data }: { data: SolicitudDetail }) {
  const fromWeb = data.kind === 'cotizacion' || data.channel !== 'WHATSAPP'
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <MessageSquareOff className="size-5" />
      </div>
      <p className="max-w-sm text-[14px] text-muted-foreground">
        {fromWeb
          ? 'Esta solicitud llegó por la web, así que no tiene un chat de WhatsApp.'
          : 'El chat de WhatsApp de esta solicitud ya no está en la bandeja.'}
      </p>
    </div>
  )
}

function CreatedMarker({ iso, ref }: { iso: string; ref: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="my-3 flex justify-center">
      <span className="flex items-center gap-1.5 rounded-full border border-ember-ring bg-ember-soft px-3 py-1 text-[12.5px] font-medium text-ember-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
        <ClipboardList className="size-3.5" />
        Solicitud creada · {messageTime(iso)}
      </span>
    </div>
  )
}

function ChatThread({
  conversation,
  kind,
  id,
  createdAt,
  active,
}: {
  conversation: SolicitudConversation
  kind: SolicitudKind
  id: number
  createdAt: string
  active: boolean
}) {
  const { data: messages = [], isLoading, isError } = useSolicitudMessages(kind, id, active)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const positioned = useRef(false)

  // Open the thread on the moment the solicitud was created: the steps that led
  // to it are right above, which is what the office wants to review.
  useEffect(() => {
    if (positioned.current || messages.length === 0) return
    const container = containerRef.current
    const marker = markerRef.current
    if (!container || !marker) return
    positioned.current = true
    const top = marker.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTop = Math.max(0, top - container.clientHeight * 0.6)
  }, [messages.length])

  const markerAt = createdIndex(messages, createdAt)
  const historyPruned = messages.length > 0 && markerAt === 0
  const loaded = !isLoading && !isError

  return (
    <div className="wa flex min-h-[60vh] flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-(--wa-line) bg-(--wa-panel) px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-(--wa-text)">
            {conversation.contactName ?? 'Contacto sin nombre'}
          </p>
          <p className="text-[12px] text-(--wa-text-2)">{CHAT_STATUS_LABEL[conversation.status]}</p>
        </div>
        {conversation.status !== 'closed' && (
          <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Link href={inboxConversationHref(conversation.id)}>
              <WhatsAppIcon className="size-3.5" />
              Abrir en Whatsapp
            </Link>
          </Button>
        )}
      </div>

      <div ref={containerRef} className="wa-wallpaper min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col px-[5%] pb-3 pt-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-(--wa-icon)" />
            </div>
          )}
          {isError && <InboxNotice tone="warning">No se pudo cargar el chat. Intentá de nuevo.</InboxNotice>}
          {loaded && messages.length === 0 && (
            <InboxNotice tone="warning">Los mensajes de este chat ya no se conservan: {RETENTION_NOTE}.</InboxNotice>
          )}
          {historyPruned && (
            <InboxNotice tone="warning">
              Los mensajes anteriores a la solicitud ya no se conservan: {RETENTION_NOTE}.
            </InboxNotice>
          )}
          {messages.map((msg, i) => {
            const prev = messages[i - 1]
            const newDay = !prev || !isSameDay(prev.createdAt, msg.createdAt)
            const first = newDay || i === markerAt || prev.role !== msg.role
            return (
              <Fragment key={msg.id}>
                {i === markerAt && <CreatedMarker ref={markerRef} iso={createdAt} />}
                {newDay && <DayDivider iso={msg.createdAt} />}
                <InboxMessageBubble message={msg} first={first} highlight="" flash={false} />
              </Fragment>
            )
          })}
          {messages.length > 0 && markerAt === messages.length && <CreatedMarker ref={markerRef} iso={createdAt} />}
        </div>
      </div>
    </div>
  )
}
