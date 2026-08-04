'use client'

import { useState } from 'react'
import { MessagesSquare, Search } from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { cn } from '@/src/lib/utils'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { InboxList } from './inbox-list'
import { InboxThread } from './inbox-thread'
import { AseguradoSheet } from './asegurado-sheet'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import type { InboxConversation } from '@/src/types/api/inbox'

type InboxFilter = 'all' | 'pending' | 'taken'

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'taken', label: 'Tomadas' },
]

function matchesFilter(conv: InboxConversation, filter: InboxFilter): boolean {
  if (filter === 'pending') return conv.status === 'pending'
  if (filter === 'taken') return conv.botPaused
  return true
}

function InboxListSkeleton() {
  return (
    <ul className="divide-y divide-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 px-4 py-3.5">
          <div className="size-9 shrink-0 animate-pulse rounded-full bg-line-2" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-line-2" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-line" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function InboxView() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const search = useDebouncedValue(searchInput, 350)

  const { data: conversations = [], isLoading } = useInboxConversations(undefined, search, scope)

  const filtered = conversations.filter(c => matchesFilter(c, filter))
  const selected = conversations.find(c => c.id === selectedId) ?? null

  const counts: Record<InboxFilter, number> = {
    all: conversations.length,
    pending: conversations.filter(c => c.status === 'pending').length,
    taken: conversations.filter(c => c.botPaused).length,
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] px-4 pb-4 pt-6">
      <div className="flex h-full overflow-hidden rounded-2xl border border-line-2 bg-card shadow-sm">
        {/* Left column — conversation list */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-line-2 bg-secondary/20">
          <div className="space-y-3 px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-[14px] tracking-[-0.01em] text-ink">Conversaciones</h2>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                {counts.all}
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar por DNI, nombre o teléfono"
                className="h-9 bg-card pl-8 text-[12.5px]"
              />
            </div>

            <ScopeFilter value={scope} onChange={setScope} className="!h-9 w-full" />

            <div className="flex gap-0.5 rounded-lg bg-secondary/70 p-0.5">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11.5px] font-medium transition-colors',
                    filter === f.key ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-ink-3',
                  )}
                >
                  {f.label}
                  {counts[f.key] > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[10px] tabular-nums',
                        filter === f.key ? 'bg-ember-soft text-ember-2' : 'bg-line-2 text-muted-foreground',
                      )}
                    >
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border-t border-line-2">
            {isLoading ? (
              <InboxListSkeleton />
            ) : (
              <InboxList conversations={filtered} selectedId={selectedId} onSelect={setSelectedId} />
            )}
          </div>
        </aside>

        {/* Right column — message thread */}
        <main className="flex min-w-0 flex-1 flex-col bg-background">
          {selected ? (
            <InboxThread conversation={selected} onOpenClient={setSelectedClientId} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-ember-soft text-ember-2 ring-1 ring-ember-ring">
                <MessagesSquare className="size-7" />
              </div>
              <div className="max-w-sm">
                <p className="font-display text-[16px] text-ink">Elegí una conversación</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  Seleccioná un chat de la lista para ver el historial completo y responderle al cliente por WhatsApp.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AseguradoSheet clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  )
}
