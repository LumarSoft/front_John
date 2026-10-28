'use client'

import { Search, X } from 'lucide-react'
import type { InboxMessage } from '@/src/types/api/inbox'
import { listTime, searchMessages, senderLabel, splitByQuery } from '../lib/inbox-format'

interface Props {
  messages: InboxMessage[]
  query: string
  onQueryChange: (query: string) => void
  onSelect: (messageId: number) => void
  onClose: () => void
}

/**
 * "Buscar mensajes", the side panel WhatsApp Web opens from the chat header:
 * every message containing the words, newest first; a click jumps to it.
 */
export function InboxSearchPanel({ messages, query, onQueryChange, onSelect, onClose }: Props) {
  const hits = searchMessages(messages, query)
  const searched = query.trim().length >= 2

  return (
    <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-(--wa-line) bg-(--wa-surface) shadow-xl sm:w-[360px] min-[1440px]:static min-[1440px]:shrink-0 min-[1440px]:shadow-none">
      <div className="flex h-[59px] shrink-0 items-center gap-6 bg-(--wa-panel) px-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar búsqueda"
          className="rounded-full p-1 text-(--wa-icon) hover:bg-(--wa-tint)"
        >
          <X className="size-5" />
        </button>
        <span className="text-[16px] text-(--wa-text)">Buscar mensajes</span>
      </div>

      <div className="border-b border-(--wa-line) px-3 py-2">
        <label className="flex h-[35px] items-center gap-3 rounded-lg bg-(--wa-panel) px-3 focus-within:bg-(--wa-surface) focus-within:ring-2 focus-within:ring-(--wa-green)">
          <Search className="size-4 shrink-0 text-(--wa-icon)" />
          <input
            autoFocus
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
            }}
            placeholder="Patente, DNI, póliza…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-(--wa-text) outline-none placeholder:text-(--wa-text-2)"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!searched ? (
          <p className="px-8 py-10 text-center text-[14px] text-(--wa-text-2)">
            Buscá palabras de esta conversación: una patente, un DNI, un número de póliza.
          </p>
        ) : hits.length === 0 ? (
          <p className="px-8 py-10 text-center text-[14px] text-(--wa-text-2)">No se encontraron mensajes.</p>
        ) : (
          <>
            <p className="px-5 pb-1 pt-3 text-[13px] text-(--wa-text-2)">
              {hits.length === 1 ? '1 mensaje' : `${hits.length} mensajes`}
            </p>
            <ul>
              {hits.map(({ message, snippet }) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(message.id)}
                    className="flex w-full flex-col gap-0.5 border-b border-(--wa-line) px-5 py-3 text-left hover:bg-(--wa-hover)"
                  >
                    <span className="text-[12.5px] text-(--wa-text-2)">
                      {listTime(message.createdAt)} · {senderLabel(message.role)}
                    </span>
                    <span className="line-clamp-2 text-[14px] leading-5 text-(--wa-text)">
                      {splitByQuery(snippet, query).map((part, i) =>
                        part.match ? (
                          <mark key={i} className="bg-transparent font-semibold text-(--wa-green-dark)">
                            {part.text}
                          </mark>
                        ) : (
                          part.text
                        ),
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  )
}
