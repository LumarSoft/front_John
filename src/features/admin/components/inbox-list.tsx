'use client'

import { MessageCircle, Trash2 } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'
import type { InboxConversation } from '@/src/types/api/inbox'
import { consultedClientLabel, contactDisplayName } from '../lib/inbox-contact'

interface Props {
  conversations: InboxConversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  onDelete: (conversation: InboxConversation) => void
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function InboxList({ conversations, selectedId, onSelect, onDelete }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <MessageCircle className="size-5" />
        </div>
        <p className="text-[13px] font-medium text-ink-3">Sin conversaciones</p>
        <p className="text-[12px] text-muted-foreground">No hay chats que coincidan con este filtro.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-line">
      {conversations.map(conv => {
        const name = contactDisplayName(conv)
        const named = name !== conv.waId
        const isSelected = selectedId === conv.id
        const isUnread = conv.unreadCount > 0

        return (
          <li key={conv.id} className="relative pr-9">
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                'relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-card',
                isUnread && !isSelected && 'bg-amber-subtle/70 hover:bg-amber-subtle',
                isSelected && 'bg-ember-soft hover:bg-ember-soft',
              )}
            >
              {(isSelected || isUnread) && (
                <span
                  className={cn(
                    'absolute inset-y-1.5 left-0 w-1 rounded-r-full',
                    isSelected ? 'bg-ember' : 'bg-amber-500',
                  )}
                />
              )}

              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                  named ? 'bg-ember-soft text-ember-2' : 'bg-secondary text-muted-foreground',
                )}
              >
                {named ? initialsOf(name) : <MessageCircle className="size-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {isUnread && (
                      <span
                        className="size-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.16)]"
                        aria-hidden
                      />
                    )}
                    <span className={cn('truncate text-[13px] text-ink', isUnread ? 'font-bold' : 'font-medium')}>
                      {name}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[11px] tabular-nums',
                      isUnread ? 'font-bold text-amber-700 dark:text-amber' : 'text-muted-foreground',
                    )}
                  >
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="block truncate text-[11.5px] text-muted-foreground">
                    {consultedClientLabel(conv) ?? (named ? conv.waId : 'Cliente sin vincular')}
                  </span>
                  <span className={cn('shrink-0 text-[10.5px]', isUnread ? 'font-semibold text-ink-3' : 'text-faint')}>
                    {conv.customerMessageCount} {conv.customerMessageCount === 1 ? 'mensaje' : 'mensajes'}
                  </span>
                </div>

                {(isUnread ||
                  conv.status === 'pending' ||
                  conv.botPaused ||
                  conv.globalBotDisabled ||
                  conv.assignedTo) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {isUnread && (
                      <Badge className="h-5 bg-amber-500 px-2 text-[10px] font-bold text-white hover:bg-amber-500">
                        {conv.unreadCount} {conv.unreadCount === 1 ? 'nuevo' : 'nuevos'}
                      </Badge>
                    )}
                    {conv.status === 'pending' && (
                      <Badge variant="outline" className="h-4 border-amber text-[10px] text-amber-700">
                        Pendiente
                      </Badge>
                    )}
                    {conv.botPaused && (
                      <Badge variant="outline" className="h-4 border-ember-2 text-[10px] text-ember-2">
                        Tomada
                      </Badge>
                    )}
                    {conv.globalBotDisabled && !conv.botPaused && (
                      <Badge variant="outline" className="h-4 border-ember-2 text-[10px] text-ember-2">
                        Atención global
                      </Badge>
                    )}
                    {conv.assignedTo && (
                      <span className="truncate text-[11px] text-muted-foreground">{conv.assignedTo.email}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
            <button
              type="button"
              title="Borrar chat"
              aria-label={`Borrar chat de ${name}`}
              onClick={() => onDelete(conv)}
              className="absolute right-1 top-3 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
