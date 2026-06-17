'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, SendHorizonal, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useInboxMessages } from '../hooks/use-inbox-messages'
import { useInboxActions } from '../hooks/use-inbox-actions'
import type { InboxConversation } from '@/src/types/api/inbox'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

interface Props {
  conversation: InboxConversation
}

function roleBubble(role: string) {
  if (role === 'user') return 'self-start bg-sidebar-accent text-ink'
  if (role === 'agent') return 'self-end bg-amber/20 text-ink'
  return 'self-end bg-ember-soft text-ember-2'
}

function roleLabel(role: string) {
  if (role === 'user') return 'Cliente'
  if (role === 'agent') return 'Asesor'
  return 'Bot'
}

export function InboxThread({ conversation }: Props) {
  const { data: messages = [], isLoading } = useInboxMessages(conversation.id)
  const { takeover, release, sendMessage } = useInboxActions(conversation.id)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Detect the 24-hour Meta window: find the last user message timestamp
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  const windowExpired =
    lastUserMsg !== undefined && Date.now() - new Date(lastUserMsg.createdAt).getTime() > TWENTY_FOUR_HOURS_MS

  const canSend = conversation.botPaused && !windowExpired
  const isSending = sendMessage.isPending

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    sendMessage.mutate(trimmed, { onSuccess: () => setText('') })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clientName = conversation.client
    ? `${conversation.client.firstName} ${conversation.client.lastName}`
    : conversation.waId

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[13.5px] font-medium text-ink">{clientName}</p>
          <p className="text-[11px] text-muted-foreground">{conversation.waId}</p>
        </div>
        <div className="flex gap-2">
          {!conversation.botPaused ? (
            <Button size="sm" variant="outline" onClick={() => takeover.mutate()} disabled={takeover.isPending}>
              {takeover.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UserCheck className="size-3.5" />}
              Tomar
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => release.mutate()} disabled={release.isPending}>
              {release.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <UserX className="size-3.5" />}
              Devolver al bot
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex max-w-[75%] flex-col gap-0.5 ${msg.role === 'user' ? 'self-start' : 'self-end'}`}
          >
            <span className="px-1 text-[10px] text-muted-foreground">{roleLabel(msg.role)}</span>
            <div className={`rounded-xl px-3 py-2 text-[13px] leading-snug ${roleBubble(msg.role)}`}>{msg.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="border-t border-line px-4 py-3">
        {windowExpired && (
          <p className="mb-2 text-[11px] text-amber-600">
            ⚠️ El usuario no escribió en más de 24 h — no se puede enviar mensaje libre (ventana Meta expirada).
          </p>
        )}
        {!conversation.botPaused && (
          <p className="mb-2 text-[11px] text-muted-foreground">Tomá la conversación para poder escribir.</p>
        )}
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canSend || isSending}
            placeholder={canSend ? 'Escribí un mensaje… (Enter para enviar)' : ''}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-line bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ember-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canSend || !text.trim() || isSending}
            className="self-end"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
