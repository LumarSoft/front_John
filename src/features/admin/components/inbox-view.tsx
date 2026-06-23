'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { InboxList } from './inbox-list'
import { InboxThread } from './inbox-thread'
import { AseguradoSheet } from './asegurado-sheet'

export function InboxView() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)

  const { data: conversations = [], isLoading } = useInboxConversations(undefined, search)

  const selected = conversations.find(c => c.id === selectedId) ?? null

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left panel — conversation list */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-line bg-sidebar">
        <div className="sticky top-0 z-10 space-y-2.5 border-b border-line bg-sidebar px-4 py-3">
          <h2 className="font-display text-[13px] tracking-[-0.01em] text-ink">Conversaciones</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por DNI, nombre o teléfono"
              className="h-8 pl-8 text-[12.5px]"
            />
          </div>
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
          <InboxThread conversation={selected} onOpenClient={setSelectedClientId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Seleccioná una conversación para ver el hilo
          </div>
        )}
      </main>

      <AseguradoSheet clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  )
}
