'use client'

import { AlertTriangle, CornerUpLeft, FileText, Info } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { InboxMessage } from '@/src/types/api/inbox'
import { adjuntoUrl } from '@/src/services/siniestros.service'
import {
  dayLabel,
  fileSize,
  isMediaPlaceholder,
  messageTime,
  senderLabel,
  splitReplyButtons,
} from '../lib/inbox-format'
import { InboxAudio } from './inbox-audio'
import { InboxMessageText } from './inbox-message-text'

// The pieces of a WhatsApp-style thread, shared by the inbox and by the
// read-only chat a solicitud shows: bubbles, the sticky day label and notices.

/** "Cupon octubre.pdf" → "PDF". */
function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : ''
}

// Sender name colours on outgoing bubbles, like participant names in a WhatsApp group.
const SENDER_COLOR: Record<InboxMessage['role'], string> = {
  user: 'text-(--wa-green-dark)',
  assistant: 'text-(--wa-author-assistant)',
  agent: 'text-(--wa-author-agent)',
}

/** The sticky "Hoy" / "Ayer" / date label above the first message of a day. */
export function DayDivider({ iso }: { iso: string }) {
  return (
    <div className="sticky top-2 z-[1] mb-1 mt-3 flex justify-center">
      <span className="rounded-[7.5px] bg-(--wa-surface) px-3 py-[5px] text-[12.5px] leading-[21px] text-(--wa-text-2) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
        {dayLabel(iso)}
      </span>
    </div>
  )
}

function mediaUrl(media: NonNullable<InboxMessage['media']>): string {
  return adjuntoUrl({
    filename: media.originalName,
    originalName: media.originalName,
    url: media.url,
    mimeType: media.mimeType,
    size: media.size ?? 0,
  })
}

/** The little notch on the first bubble of a group. */
function BubbleTail({ outgoing }: { outgoing: boolean }) {
  return (
    <svg
      viewBox="0 0 8 13"
      className={cn(
        'absolute top-0 h-[13px] w-2',
        outgoing ? '-right-2 text-(--wa-bubble-out)' : '-left-2 -scale-x-100 text-(--wa-bubble-in)',
      )}
      aria-hidden
    >
      <path d="M0 0h6.2C7.9 0 8.4 1.1 7.4 2.4L0 12.6z" fill="currentColor" />
    </svg>
  )
}

export function InboxMessageBubble({
  message,
  first,
  highlight,
  flash,
}: {
  message: InboxMessage
  first: boolean
  highlight: string
  flash: boolean
}) {
  const outgoing = message.role !== 'user'
  const isImage = message.media?.mimeType.startsWith('image/') ?? false
  const isAudio = message.media?.mimeType.startsWith('audio/') ?? false
  const caption = isMediaPlaceholder(message.content) ? '' : message.content
  const { body, buttons } = message.role === 'assistant' ? splitReplyButtons(caption) : { body: caption, buttons: [] }
  const time = messageTime(message.createdAt)

  return (
    <div
      data-message-id={message.id}
      className={cn(
        '-mx-2 flex rounded-md px-2 transition-colors duration-700',
        outgoing ? 'justify-end' : 'justify-start',
        first ? 'mt-3' : 'mt-0.5',
        flash && 'bg-(--wa-green)/25',
      )}
    >
      <div className="flex max-w-[min(65%,560px)] flex-col gap-0.5">
        <div
          className={cn(
            'relative rounded-[7.5px] text-[14.2px] leading-[19px] text-(--wa-text) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]',
            outgoing ? 'bg-(--wa-bubble-out)' : 'bg-(--wa-bubble-in)',
            first && (outgoing ? 'rounded-tr-none' : 'rounded-tl-none'),
            isImage ? 'p-[3px]' : 'px-[9px] pb-2 pt-1.5',
          )}
        >
          {first && <BubbleTail outgoing={outgoing} />}

          {first && outgoing && (
            <p
              className={cn(
                'text-[12.8px] font-medium leading-[22px]',
                SENDER_COLOR[message.role],
                isImage && 'px-1.5',
              )}
            >
              {senderLabel(message.role)}
            </p>
          )}

          {isImage && message.media ? (
            <>
              <a
                href={mediaUrl(message.media)}
                target="_blank"
                rel="noreferrer"
                className="relative block"
                title="Abrir imagen en tamaño completo"
              >
                {/* Signed API URLs are dynamic and cannot go through Next's image optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(message.media)}
                  alt={
                    message.media.tipo
                      ? `Imagen: ${message.media.tipo.replaceAll('_', ' ')}`
                      : outgoing
                        ? 'Imagen enviada al cliente'
                        : 'Imagen enviada por el cliente'
                  }
                  className="max-h-[338px] w-auto max-w-[330px] rounded-[6px] object-cover"
                />
                {!caption && (
                  <span className="absolute inset-x-0 bottom-0 flex h-7 items-end justify-end rounded-b-[6px] bg-linear-to-t from-black/40 to-transparent px-2 pb-1 text-[11px] text-white">
                    {time}
                  </span>
                )}
              </a>
              {caption && (
                <p className="relative px-1.5 pb-1.5 pt-1">
                  <InboxMessageText text={caption} highlight={highlight} />
                  <span className="inline-block w-12" />
                  <span className="absolute bottom-1 right-2 text-[11px] leading-[15px] text-(--wa-text-2)">
                    {time}
                  </span>
                </p>
              )}
            </>
          ) : (
            <div className="relative">
              {isAudio && message.media ? (
                <InboxAudio src={mediaUrl(message.media)} transcript={caption} highlight={highlight} />
              ) : message.media ? (
                <>
                  <a
                    href={mediaUrl(message.media)}
                    target="_blank"
                    rel="noreferrer"
                    title="Abrir el archivo"
                    className="-mx-1 flex min-w-[240px] items-center gap-3 rounded-[6px] bg-(--wa-tint) px-3 py-2.5 hover:bg-(--wa-tint-strong)"
                  >
                    <FileText className="size-8 shrink-0 text-[#e2574c]" strokeWidth={1.5} />
                    <span className="min-w-0">
                      <span className="block truncate text-[14px]">{message.media.originalName}</span>
                      <span className="block text-[12px] text-(--wa-text-2)">
                        {[fileExtension(message.media.originalName), fileSize(message.media.size)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </a>
                  {caption && (
                    <span className="mt-1.5 block">
                      <InboxMessageText text={caption} highlight={highlight} />
                    </span>
                  )}
                </>
              ) : (
                <InboxMessageText text={body || message.content} highlight={highlight} />
              )}
              {/* Reserves room so the time never overlaps the last line, as in WhatsApp. */}
              <span className="inline-block w-12" />
              <span className="absolute -bottom-1 right-0 text-[11px] leading-[15px] text-(--wa-text-2)">{time}</span>
            </div>
          )}
        </div>
        {buttons.map(label => (
          <div
            key={label}
            className="flex items-center justify-center gap-1.5 rounded-[7.5px] bg-(--wa-bubble-out) px-3 py-2 text-[14px] text-(--wa-link) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
          >
            <CornerUpLeft className="size-4 shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function InboxNotice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: React.ReactNode }) {
  const Icon = tone === 'warning' ? AlertTriangle : Info
  return (
    <div className="my-3 flex justify-center">
      <div className="flex max-w-[min(85%,520px)] items-start gap-2 rounded-[7.5px] bg-(--wa-notice) px-3 py-[6px] text-center text-[12.5px] leading-[18px] text-(--wa-icon) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
        <Icon className="mt-px size-3.5 shrink-0" />
        <span>{children}</span>
      </div>
    </div>
  )
}
