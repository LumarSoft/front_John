'use client'

import { Loader2, MessageSquareText, Trash2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { AssistantConversationSummary } from '@/src/types/api/assistant'
import { useAssistantHistory } from '../hooks/use-assistant'

const DAY_MS = 86_400_000

function groupOf(updatedAt: string, now: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const at = new Date(updatedAt).getTime()
  if (at >= today) return 'Hoy'
  if (at >= today - DAY_MS) return 'Ayer'
  if (at >= today - 6 * DAY_MS) return 'Últimos 7 días'
  return 'Antes'
}

function timeOf(updatedAt: string, now: Date): string {
  const at = new Date(updatedAt)
  return now.getTime() - at.getTime() < 6 * DAY_MS
    ? at.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : at.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

interface AssistantHistoryProps {
  currentId: number | null
  onOpen: (id: number) => void
  onRemove: (id: number) => void
}

/** The person's past conversations, grouped by when they last used them. */
export function AssistantHistory({ currentId, onOpen, onRemove }: AssistantHistoryProps) {
  const { data, isLoading, isError } = useAssistantHistory(true)
  const now = new Date()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError || !data?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <MessageSquareText className="size-5 text-faint" />
        <p className="text-[13px] text-muted-foreground">
          {isError ? 'No se pudo cargar el historial.' : 'Todavía no tenés conversaciones guardadas.'}
        </p>
      </div>
    )
  }

  const groups = data.reduce<Array<{ label: string; items: AssistantConversationSummary[] }>>((acc, item) => {
    const label = groupOf(item.updatedAt, now)
    const group = acc.find(g => g.label === label)
    if (group) group.items.push(item)
    else acc.push({ label, items: [item] })
    return acc
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {groups.map(group => (
        <section key={group.label} className="flex flex-col gap-0.5">
          <h3 className="px-2 pb-1 text-[11.5px] font-medium tracking-wide text-faint uppercase">{group.label}</h3>
          {group.items.map(item => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-secondary',
                item.id === currentId && 'bg-ember-soft hover:bg-ember-soft',
              )}
            >
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
              >
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[13px] text-ink-2',
                    item.id === currentId && 'text-ember-2',
                  )}
                >
                  {item.title}
                </span>
                <span className="shrink-0 text-[11.5px] text-faint">{timeOf(item.updatedAt, now)}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="grid size-7 shrink-0 place-items-center rounded-md text-faint opacity-0 transition hover:bg-background hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100 dark:hover:text-red-400"
                aria-label={`Borrar «${item.title}»`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </section>
      ))}
      <p className="px-2 text-[11.5px] text-faint">Las conversaciones sin uso se borran a los 90 días.</p>
    </div>
  )
}
