'use client'

import { Badge } from '@/src/components/ui/badge'
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

export function InboxList({ conversations, selectedId, onSelect }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Sin conversaciones activas
      </div>
    )
  }

  return (
    <ul className="divide-y divide-line">
      {conversations.map(conv => (
        <li key={conv.id}>
          <button
            type="button"
            onClick={() => onSelect(conv.id)}
            className={`w-full px-4 py-3 text-left transition-colors hover:bg-sidebar-accent ${
              selectedId === conv.id ? 'bg-ember-soft' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-[13px] font-medium text-ink">{displayName(conv)}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(conv.lastMessageAt)}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
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
          </button>
        </li>
      ))}
    </ul>
  )
}
