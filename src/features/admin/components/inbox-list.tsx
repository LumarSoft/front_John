'use client'

import { Camera, ChevronDown, Clock, FileText, Headset, MessageCircle, Mic, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { cn } from '@/src/lib/utils'
import type { InboxConversation, InboxLastMessage } from '@/src/types/api/inbox'
import { contactDisplayName, formatPhone } from '../lib/inbox-contact'
import { isMediaPlaceholder, listTime, plainPreview, senderLabel } from '../lib/inbox-format'
import { InboxAvatar } from './inbox-avatar'

interface Props {
  conversations: InboxConversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  onDelete: (conversation: InboxConversation) => void
}

const MEDIA = {
  image: { icon: Camera, label: 'Foto' },
  audio: { icon: Mic, label: 'Audio' },
  file: { icon: FileText, label: 'Documento' },
} as const

function Preview({ message }: { message: InboxLastMessage }) {
  const media = message.mediaType ? MEDIA[message.mediaType] : null
  // A voice note's content is its transcription: the list shows "Audio" like WhatsApp.
  const caption =
    message.mediaType === 'audio' || isMediaPlaceholder(message.content) ? null : plainPreview(message.content)
  const Icon = media?.icon

  return (
    <>
      {message.role !== 'user' && <span className="shrink-0">{senderLabel(message.role)}:</span>}
      {Icon && <Icon className="size-4 shrink-0" />}
      <span className="truncate">{caption || media?.label || message.content}</span>
    </>
  )
}

export function InboxList({ conversations, selectedId, onSelect, onDelete }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-8 py-16 text-center text-(--wa-text-2)">
        <MessageCircle className="size-8 text-(--wa-icon) opacity-60" />
        <p className="text-[14px]">No hay chats que coincidan con este filtro.</p>
      </div>
    )
  }

  return (
    <ul>
      {conversations.map(conv => {
        const name = contactDisplayName(conv)
        const isSelected = selectedId === conv.id
        const isUnread = conv.unreadCount > 0
        const taken = conv.botPaused || conv.globalBotDisabled

        return (
          <li key={conv.id} className="group relative">
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex h-[72px] w-full items-center text-left transition-colors',
                isSelected ? 'bg-(--wa-selected)' : 'hover:bg-(--wa-hover)',
              )}
            >
              <span className="pl-3 pr-[15px]">
                <InboxAvatar className="size-[49px]" />
              </span>

              <span className="flex h-full min-w-0 flex-1 flex-col justify-center border-b border-(--wa-line) pr-[15px] group-last:border-b-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[17px] leading-[21px] text-(--wa-text)">{name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {/* Status marks, like WhatsApp Business labels next to the time. */}
                    {taken ? (
                      <Headset
                        className="size-3.5 text-(--wa-green-dark)"
                        aria-label={conv.botPaused ? 'Tomada por una persona' : 'Atención humana global'}
                      >
                        <title>{conv.botPaused ? 'Tomada por una persona' : 'Atención humana global'}</title>
                      </Headset>
                    ) : (
                      conv.status === 'pending' && (
                        <Clock className="size-3.5 text-amber-600" aria-label="Pendiente">
                          <title>Pendiente</title>
                        </Clock>
                      )
                    )}
                    <span
                      className={cn(
                        'text-[12px] leading-[14px]',
                        isUnread ? 'font-medium text-(--wa-unread)' : 'text-(--wa-text-2)',
                      )}
                    >
                      {listTime(conv.lastMessage?.createdAt ?? conv.lastMessageAt)}
                    </span>
                  </span>
                </span>

                <span className="mt-[3px] flex min-h-5 items-center justify-between gap-2">
                  <span
                    className={cn(
                      'flex min-w-0 items-center gap-1 text-[14px] leading-5',
                      isUnread ? 'text-(--wa-text)' : 'text-(--wa-text-2)',
                    )}
                  >
                    {conv.lastMessage ? (
                      <Preview message={conv.lastMessage} />
                    ) : (
                      <span className="truncate">{formatPhone(conv.waId)}</span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5">
                    {isUnread && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--wa-unread) px-1.5 text-[12px] font-semibold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                    {/* Room for the hover chevron, as WhatsApp slides it in next to the badges. */}
                    <span className="w-0 transition-[width] group-hover:w-5 group-has-[[data-state=open]]:w-5" />
                  </span>
                </span>
              </span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Opciones del chat de ${name}`}
                className="absolute bottom-[14px] right-[13px] rounded-full text-(--wa-icon) opacity-0 outline-none group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              >
                <ChevronDown className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="wa w-auto min-w-44">
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(conv)}>
                  <Trash2 className="size-4" /> Borrar chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )
      })}
    </ul>
  )
}
