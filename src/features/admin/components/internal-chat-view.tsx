'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, MessagesSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { ApiError } from '@/src/lib/api-client'
import { cn } from '@/src/lib/utils'
import { usePlanFeatures } from '../hooks/use-billing'
import { useProfile } from '../hooks/use-profile'
import { useInternalChatActions, useInternalChatPeople, useInternalChats } from '../hooks/use-internal-chat'
import { INTERNAL_CHAT_PATH, internalChatHref } from '../lib/internal-chat-format'
import { InternalChatList } from './internal-chat-list'
import { InternalChatThread } from './internal-chat-thread'

/**
 * "Chat interno": the office's own chat, apart from the WhatsApp chats with
 * clients. The team chat, a direct chat per coworker, and the coworkers one
 * has not written to yet.
 */
export function InternalChatView() {
  const searchParams = useSearchParams()
  // The new-message notice links here with ?chat=8 to open that chat.
  const linkedId = Number(searchParams.get('chat')) || null
  const [pickedId, setPickedId] = useState<number | null | undefined>(undefined)
  const selectedId = pickedId === undefined ? linkedId : pickedId
  const { data: profile } = useProfile()
  // Undefined until the plan's functions are known: nothing is asked before that.
  const { data: planFeatures } = usePlanFeatures()
  const included = planFeatures?.features.internal_chat
  const { data: chats = [], isPending, isError, error } = useInternalChats(included === true)
  const { data: people = [] } = useInternalChatPeople(included === true)
  const { openDirect } = useInternalChatActions()

  // Switching chats is local state; the URL only mirrors it so a reload reopens the same chat.
  const select = (chatId: number | null) => {
    setPickedId(chatId)
    window.history.replaceState(
      window.history.state,
      '',
      chatId === null ? INTERNAL_CHAT_PATH : internalChatHref(chatId),
    )
  }

  const startChat = (personId: number) => {
    openDirect.mutate(personId, {
      onSuccess: chat => select(chat.id),
      onError: () => toast.error('No se pudo abrir el chat'),
    })
  }

  // The plans of the organization's numbers leave the chat out (or did since the page opened).
  if (included === false || (error instanceof ApiError && error.status === 403)) {
    return <InternalChatLocked availableIn={planFeatures?.availableIn.internal_chat ?? null} />
  }

  const selected = chats.find(chat => chat.id === selectedId) ?? null
  const withChat = new Set(chats.map(chat => chat.person?.id))
  const peopleWithoutChat = people.filter(person => !withChat.has(person.id))

  return (
    <div className="mx-auto flex h-[calc(100svh-3.5rem)] w-full max-w-[1200px] flex-col p-3 sm:p-4 md:h-[calc(100svh-4.5rem)]">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line-2 bg-card">
        <aside
          className={cn(
            'w-full min-w-0 shrink-0 flex-col border-line-2 md:flex md:w-[320px] md:border-r',
            selected ? 'hidden' : 'flex',
          )}
        >
          <div className="shrink-0 border-b border-line-2 px-4 py-3">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <MessagesSquare className="size-4 text-ember-2" /> Chats del equipo
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Para hablar entre ustedes sin salir del panel. Nada de esto llega a WhatsApp.
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isError ? (
              <p role="alert" className="p-6 text-center text-[13px] text-destructive">
                No se pudieron cargar los chats.
              </p>
            ) : isPending ? (
              <p className="flex items-center justify-center gap-2 p-6 text-[13px] text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Cargando chats…
              </p>
            ) : (
              <InternalChatList
                chats={chats}
                people={peopleWithoutChat}
                selectedId={selected?.id ?? null}
                myId={profile?.id}
                startingId={openDirect.isPending ? (openDirect.variables ?? null) : null}
                onSelect={select}
                onStart={startChat}
              />
            )}
          </div>
        </aside>

        <main className={cn('min-w-0 flex-1 flex-col md:flex', selected ? 'flex' : 'hidden')}>
          {selected ? (
            <InternalChatThread
              key={selected.id}
              chat={selected}
              myId={profile?.id}
              teamSize={people.length + 1}
              onBack={() => select(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-secondary/30 px-6 text-center">
              <MessagesSquare className="size-14 text-ember-2/60" />
              <p className="text-[18px] font-medium text-ink">
                {selectedId !== null && !isPending ? 'No encontramos ese chat' : 'Chat interno'}
              </p>
              <p className="max-w-sm text-[13px] text-muted-foreground">
                Elegí «Todo el equipo» para escribirles a todos, o una persona para hablar solo con ella.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/** What the section shows when the organization's plans leave the chat out. */
function InternalChatLocked({ availableIn }: { availableIn: string | null }) {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10">
      <div className="rounded-xl border border-line-2 bg-card px-6 py-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-ember-soft text-ember-2">
          <Lock className="size-5" />
        </span>
        <h2 className="mt-4 text-[17px] font-semibold text-ink">El chat interno no está en tu plan</h2>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Es un chat para que el equipo hable entre sí sin salir del panel
          {availableIn ? `. Está desde el plan ${availableIn}` : ''}. El plan de cada número se elige en Facturación.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/admin/facturacion">Ver Facturación</Link>
        </Button>
      </div>
    </div>
  )
}
