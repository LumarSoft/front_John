'use client'

import { useState } from 'react'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { InboxList } from './inbox-list'
import { InboxThread } from './inbox-thread'

export function InboxView() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: conversations = [], isLoading } = useInboxConversations()

  const selected = conversations.find(c => c.id === selectedId) ?? null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left panel — conversation list */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-line bg-sidebar">
        <div className="sticky top-0 z-10 border-b border-line bg-sidebar px-4 py-3">
          <h2 className="font-display text-[13px] tracking-[-0.01em] text-ink">Conversaciones</h2>
        </div>
        {isLoading ? (
          <div className="px-4 py-6 text-[12px] text-muted-foreground">Cargando…</div>
        ) : (
          <InboxList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </aside>

      {/* Right panel — message thread */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {selected ? (
          <InboxThread conversation={selected} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Seleccioná una conversación para ver el hilo
          </div>
        )}
      </main>
    </div>
  )
}
