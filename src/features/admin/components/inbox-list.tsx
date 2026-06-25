'use client'

import { MessageCircle } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { cn } from '@/src/lib/utils'
import type { InboxConversation } from '@/src/types/api/inbox'

interface Props {
  conversations: InboxConversation[]
  selectedId: number | null
  onSelect: (id: number) => void
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

function displayName(conv: InboxConversation): string {
  if (conv.client) return `${conv.client.firstName} ${conv.client.lastName}`
  return conv.waId
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function InboxList({ conversations, selectedId, onSelect }: Props) {
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
        const name = displayName(conv)
        const isSelected = selectedId === conv.id

        return (
          <li key={conv.id}>
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                'relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-card',
                isSelected && 'bg-ember-soft hover:bg-ember-soft',
              )}
            >
              {isSelected && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-ember" />}

              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                  conv.client ? 'bg-ember-soft text-ember-2' : 'bg-secondary text-muted-foreground',
                )}
              >
                {conv.client ? initialsOf(name) : <MessageCircle className="size-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {conv.status === 'pending' && (
                      <span className="size-1.5 shrink-0 rounded-full bg-ember" aria-hidden />
                    )}
                    <span className="truncate text-[13px] font-medium text-ink">{name}</span>
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                </div>

                <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                  {conv.client ? `DNI ${conv.client.dni}` : 'Cliente sin vincular'}
                </span>

                {(conv.status === 'pending' || conv.botPaused || conv.assignedTo) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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
                    {conv.assignedTo && (
                      <span className="truncate text-[11px] text-muted-foreground">{conv.assignedTo.email}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
