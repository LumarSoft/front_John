'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, MoreVertical, Search, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { inboxService } from '@/src/services/inbox.service'
import { useAuth } from '../context/auth-context'
import { Button } from '@/src/components/ui/button'
import { SidebarTrigger } from '@/src/components/ui/sidebar'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/src/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { cn } from '@/src/lib/utils'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import { useInboxConversations } from '../hooks/use-inbox-conversations'
import { InboxList } from './inbox-list'
import { InboxThread } from './inbox-thread'
import { AseguradoSheet } from './asegurado-sheet'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import type { InboxConversation } from '@/src/types/api/inbox'
import { contactDisplayName } from '../lib/inbox-contact'

type InboxFilter = 'all' | 'unread' | 'pending' | 'taken'

const FILTERS: { key: InboxFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'unread', label: 'No leídos' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'taken', label: 'Tomados' },
]

function matchesFilter(conv: InboxConversation, filter: InboxFilter): boolean {
  if (filter === 'unread') return conv.unreadCount > 0
  if (filter === 'pending') return conv.status === 'pending'
  if (filter === 'taken') return conv.botPaused || conv.globalBotDisabled
  return true
}

function InboxListSkeleton() {
  return (
    <ul>
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="flex h-[72px] items-center gap-[15px] px-3">
          <div className="size-[49px] shrink-0 animate-pulse rounded-full bg-(--wa-panel)" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="h-3 w-1/2 animate-pulse rounded bg-(--wa-panel)" />
            <div className="h-2.5 w-3/4 animate-pulse rounded bg-(--wa-panel)" />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Link to the inbox with a conversation already open (used by Novedades). */
export function inboxConversationHref(conversationId: number): string {
  return `/admin/inbox?conversation=${conversationId}`
}

export function InboxView() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<InboxConversation | 'all' | null>(null)
  const searchParams = useSearchParams()
  // A Novedad links here with ?conversation=123 to open that chat.
  const linkedId = Number(searchParams.get('conversation')) || null
  const [pickedId, setPickedId] = useState<number | null | undefined>(undefined)
  const selectedId = pickedId === undefined ? linkedId : pickedId
  // Switching chats is local state, so it is instant and never depends on a
  // Next navigation round-trip. The URL only mirrors it (replaceState, no
  // navigation) so a reload or a shared link reopens the same chat.
  const selectConversation = (id: number) => {
    setPickedId(id)
    window.history.replaceState(window.history.state, '', inboxConversationHref(id))
  }
  const clearSelection = () => {
    setPickedId(null)
    window.history.replaceState(window.history.state, '', '/admin/inbox')
  }
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const search = useDebouncedValue(searchInput, 350)

  const { data: conversations = [], isLoading } = useInboxConversations(undefined, search, scope)

  const deletion = useMutation({
    mutationFn: (target: InboxConversation | 'all') =>
      inboxService.deleteConversations(token as string, target === 'all' ? undefined : target.id),
    onSuccess: async (result, target) => {
      if (target === 'all' || target.id === selectedId) clearSelection()
      queryClient.removeQueries({
        predicate: query =>
          query.queryKey[0] === 'admin' &&
          query.queryKey[1] === 'inbox' &&
          query.queryKey[3] === 'messages' &&
          (target === 'all' || query.queryKey[2] === target.id),
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'inbox'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'novedades'] }),
      ])
      setDeleteTarget(null)
      toast.success(`${result.deletedCount} ${result.deletedCount === 1 ? 'chat borrado' : 'chats borrados'}`)
    },
    onError: () => toast.error('No se pudieron borrar los chats. Intentá nuevamente.'),
  })

  const filtered = conversations.filter(c => matchesFilter(c, filter))
  const selected = conversations.find(c => c.id === selectedId) ?? null

  const counts: Record<InboxFilter, number> = {
    all: 0,
    unread: conversations.filter(c => c.unreadCount > 0).length,
    pending: conversations.filter(c => c.status === 'pending').length,
    taken: conversations.filter(c => c.botPaused || c.globalBotDisabled).length,
  }

  return (
    <div className="wa flex h-svh overflow-hidden bg-(--wa-surface) md:h-[calc(100svh-1rem)] md:rounded-xl">
      {/* Chat list */}
      <aside
        className={cn(
          'w-full flex-col bg-(--wa-surface) md:flex md:w-[30%] md:min-w-[360px] md:max-w-[440px]',
          selectedId ? 'hidden' : 'flex',
        )}
      >
        <div className="flex h-[59px] shrink-0 items-center gap-2 pl-3 pr-3">
          <SidebarTrigger className="text-(--wa-icon) hover:bg-black/5" />
          <h2 className="text-[22px] font-bold text-(--wa-text)">Chats</h2>
          <div className="ml-auto flex min-w-0 items-center gap-1">
            <ScopeFilter
              value={scope}
              onChange={setScope}
              allLabel="Todos los números"
              className={cn(
                '!h-8 min-w-0 max-w-[180px] cursor-pointer truncate !rounded-full !border-0 !px-3 !text-[13px] outline-none',
                scope.phoneNumberId != null || scope.producerCodeId != null
                  ? '!bg-(--wa-green-soft) !text-(--wa-green-dark)'
                  : '!bg-(--wa-panel) !text-(--wa-text-2)',
              )}
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Más opciones"
                className="ml-auto rounded-full p-2 text-(--wa-icon) outline-none hover:bg-black/5 data-[state=open]:bg-black/10 [:is(select)+&]:ml-0"
              >
                <MoreVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="wa w-auto min-w-52">
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget('all')}>
                  <Trash2 className="size-4" /> Borrar todos los chats
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 px-3 pb-2">
          <label className="flex h-[35px] items-center gap-3 rounded-lg bg-(--wa-panel) px-3 focus-within:bg-(--wa-surface) focus-within:ring-2 focus-within:ring-(--wa-green)">
            <Search className="size-4 shrink-0 text-(--wa-icon)" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, DNI o teléfono"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-(--wa-text) outline-none placeholder:text-(--wa-text-2)"
            />
          </label>

          <div className="flex gap-1 overflow-x-auto pb-1 pt-1 [scrollbar-width:none]">
            {FILTERS.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-[13.5px] transition-colors',
                  filter === f.key
                    ? 'bg-(--wa-green-soft) text-(--wa-green-dark)'
                    : 'bg-(--wa-panel) text-(--wa-text-2) hover:bg-[#e9edef]',
                )}
              >
                {f.label}
                {counts[f.key] > 0 && <span className="text-[11.5px] tabular-nums">{counts[f.key]}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <InboxListSkeleton />
          ) : (
            <InboxList
              conversations={filtered}
              selectedId={selectedId}
              onSelect={selectConversation}
              onDelete={setDeleteTarget}
            />
          )}
        </div>
      </aside>

      {/* Conversation */}
      <main className={cn('min-w-0 flex-1 flex-col md:flex', selectedId ? 'flex' : 'hidden')}>
        {selected ? (
          <InboxThread
            key={selected.id}
            conversation={selected}
            onOpenClient={setSelectedClientId}
            onBack={clearSelection}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 border-l border-(--wa-line) bg-(--wa-panel) px-6 text-center">
            <WhatsAppIcon className="size-24 text-(--wa-unread)" />
            {selectedId && !isLoading ? (
              <div className="max-w-md">
                <p className="text-[28px] font-light text-(--wa-text)">No encontramos ese chat</p>
                <p className="mt-3 text-[14px] leading-5 text-(--wa-text-2)">
                  Puede estar cerrado o fuera de los filtros actuales. Elegí un chat de la lista.
                </p>
              </div>
            ) : (
              <div className="max-w-md">
                <p className="text-[32px] font-light text-(--wa-text)">Whatsapp</p>
                <p className="mt-3 text-[14px] leading-5 text-(--wa-text-2)">
                  Elegí un chat de la lista para ver la conversación completa y responderle al cliente.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open && !deletion.isPending) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget === 'all' ? '¿Borrar todos los chats?' : '¿Borrar este chat?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === 'all'
                ? 'Se borrarán todas las conversaciones a las que tenés acceso, incluidas las cerradas y las que no aparecen con los filtros actuales.'
                : `Se borrará la conversación de ${deleteTarget ? contactDisplayName(deleteTarget) : ''}.`}{' '}
              Se eliminarán sus mensajes y se reiniciará el bot para esos chats. Los clientes, pólizas, cotizaciones y
              siniestros se conservan. Esta acción no se puede deshacer desde el panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletion.isPending}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deletion.isPending || deleteTarget === null}
              onClick={() => {
                if (deleteTarget) deletion.mutate(deleteTarget)
              }}
            >
              {deletion.isPending && <Loader2 className="size-4 animate-spin" />}
              {deleteTarget === 'all' ? 'Sí, borrar todos' : 'Sí, borrar chat'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AseguradoSheet clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  )
}
