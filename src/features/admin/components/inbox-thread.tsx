'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { AlertTriangle, IdCard, Info, Loader2, MessageCircle, SendHorizonal, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import { useInboxMessages } from '../hooks/use-inbox-messages'
import { useInboxActions } from '../hooks/use-inbox-actions'
import type { InboxConversation } from '@/src/types/api/inbox'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

interface Props {
  conversation: InboxConversation
  onOpenClient: (clientId: number) => void
}

function roleBubble(role: string) {
  if (role === 'user') return 'bg-card border border-line-2 text-ink rounded-bl-md'
  if (role === 'agent') return 'bg-ember text-on-dark rounded-br-md'
  return 'bg-ember-soft text-ink border border-ember/15 rounded-br-md'
}

function roleLabel(role: string) {
  if (role === 'user') return 'Cliente'
  if (role === 'agent') return 'Asesor'
  return 'Bot'
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Hoy'
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Ayer'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function InboxThread({ conversation, onOpenClient }: Props) {
  const { data: messages = [], isLoading } = useInboxMessages(conversation.id)
  const { takeover, release, sendMessage } = useInboxActions(conversation.id)
  const [text, setText] = useState('')
  const [windowExpired, setWindowExpired] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Detect the 24-hour Meta window: free-text replies are only allowed within
  // 24 h of the last inbound user message. The clock is read asynchronously (in
  // a timer callback, not during render) and re-checked every minute so the
  // banner flips on its own if the window expires while the chat is open.
  useEffect(() => {
    const check = () => {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      setWindowExpired(
        lastUserMsg !== undefined && Date.now() - new Date(lastUserMsg.createdAt).getTime() > TWENTY_FOUR_HOURS_MS,
      )
    }
    const first = setTimeout(check, 0)
    const interval = setInterval(check, 60_000)
    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [messages])

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

  const client = conversation.client
  const clientName = client ? `${client.firstName} ${client.lastName}` : conversation.waId
  const initials = client ? initialsOf(clientName) : ''

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ember-soft text-[13px] font-semibold text-ember-2">
            {initials || <MessageCircle className="size-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[14px] font-semibold text-ink">{clientName}</p>
              <span
                className={cn(
                  'hidden shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium sm:inline-flex',
                  conversation.botPaused
                    ? 'border-ember/25 bg-ember-soft text-ember-2'
                    : 'border-line-2 bg-secondary text-muted-foreground',
                )}
              >
                <span
                  className={cn('size-1.5 rounded-full', conversation.botPaused ? 'bg-ember-2' : 'bg-faint-2')}
                  aria-hidden
                />
                {conversation.botPaused ? 'Atención humana' : 'Bot activo'}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
              {client ? `DNI ${client.dni} · ${conversation.waId}` : conversation.waId}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {client && (
            <Button size="sm" variant="outline" onClick={() => onOpenClient(client.id)}>
              <IdCard className="size-3.5" />
              Ver ficha
            </Button>
          )}
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
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <MessageCircle className="size-5" />
              </div>
              <p className="text-[13px] text-muted-foreground">Todavía no hay mensajes en esta conversación.</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const prev = messages[i - 1]
            const showDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt)
            return (
              <Fragment key={msg.id}>
                {showDay && (
                  <div className="my-1.5 flex items-center justify-center">
                    <span className="rounded-full bg-secondary px-3 py-1 text-[10.5px] font-medium text-muted-foreground">
                      {dayLabel(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={cn('flex max-w-[82%] flex-col gap-1', isUser ? 'self-start' : 'self-end')}>
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm',
                      roleBubble(msg.role),
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className={cn('px-1 text-[10.5px] text-faint', isUser ? 'text-left' : 'text-right')}>
                    {roleLabel(msg.role)} · {fmtTime(msg.createdAt)}
                  </span>
                </div>
              </Fragment>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply box */}
      <div className="shrink-0 border-t border-line bg-card px-4 py-3">
        <div className="mx-auto w-full max-w-4xl">
          {windowExpired && (
            <div className="mb-2.5 flex items-start gap-2 rounded-lg border border-amber/30 bg-amber-subtle px-3 py-2 text-[11.5px] leading-relaxed text-amber-700 dark:text-amber">
              <AlertTriangle className="mt-px size-3.5 shrink-0" />
              <span>
                El usuario no escribió en más de 24 h. No se puede enviar un mensaje libre (ventana de Meta expirada).
              </span>
            </div>
          )}
          {!conversation.botPaused && (
            <div className="mb-2.5 flex items-start gap-2 rounded-lg border border-line-2 bg-secondary/50 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" />
              <span>
                Tomá la conversación con <span className="font-medium text-ink-3">Tomar</span> para poder escribir.
              </span>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canSend || isSending}
              placeholder={canSend ? 'Escribí un mensaje… (Enter para enviar, Shift+Enter para salto de línea)' : ''}
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-line-2 bg-background px-3.5 py-3 text-[13px] leading-relaxed placeholder:text-muted-foreground focus:border-ember focus:outline-none focus:ring-[3px] focus:ring-ember/15 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!canSend || !text.trim() || isSending}
              className="size-11 shrink-0 rounded-xl"
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
