'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CornerUpLeft,
  FileText,
  ChevronDown,
  IdCard,
  Info,
  Loader2,
  MoreVertical,
  Paperclip,
  Pencil,
  Search,
  SendHorizontal,
  Smile,
  UserCheck,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { cn } from '@/src/lib/utils'
import { useInboxMessages } from '../hooks/use-inbox-messages'
import { useInboxActions } from '../hooks/use-inbox-actions'
import { useChatScroll } from '../hooks/use-chat-scroll'
import type { InboxConversation, InboxMessage, UpdateInboxContactRequest } from '@/src/types/api/inbox'
import { adjuntoUrl } from '@/src/services/siniestros.service'
import { consultedClientLabel, contactDisplayName, formatPhone, hasContactName } from '../lib/inbox-contact'
import {
  dayLabel,
  fileSize,
  firstUnreadId,
  OUTGOING_FILE_ACCEPT,
  outgoingFileProblem,
  isMediaPlaceholder,
  isSameDay,
  messageTime,
  senderLabel,
  splitReplyButtons,
} from '../lib/inbox-format'
import { ApiError } from '@/src/lib/api-client'
import { InboxAttachmentPreview } from './inbox-attachment-preview'
import { InboxAudio } from './inbox-audio'
import { InboxAvatar } from './inbox-avatar'
import { InboxContactDialog } from './inbox-contact-dialog'
import { InboxMessageText } from './inbox-message-text'
import { InboxSearchPanel } from './inbox-search-panel'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

/**
 * Why a reply did not go out. The API explains a disconnected number (409) and a
 * send WhatsApp rejected (502) in the agent's words; anything else gets the fallback.
 */
function sendFailureMessage(error: Error, fallback: string): string {
  return error instanceof ApiError && (error.status === 409 || error.status === 502) ? error.message : fallback
}

/** "Cupon octubre.pdf" → "PDF". */
function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : ''
}

const EMOJIS = [
  '😀',
  '😊',
  '🙂',
  '😉',
  '😅',
  '🙏',
  '👍',
  '👌',
  '👏',
  '🙌',
  '💪',
  '🤝',
  '😢',
  '😮',
  '🤔',
  '😬',
  '❤️',
  '✅',
  '❌',
  '⚠️',
  '📄',
  '📎',
  '📷',
  '🚗',
  '🏍️',
  '🏠',
  '🔧',
  '🚑',
  '📞',
  '💳',
  '📅',
  '⏰',
  '👋',
  '✨',
  '🎉',
  '📌',
]

// Sender name colours on outgoing bubbles, like participant names in a WhatsApp group.
const SENDER_COLOR: Record<InboxMessage['role'], string> = {
  user: 'text-(--wa-green-dark)',
  assistant: 'text-[#1f7aa8]',
  agent: 'text-[#b4532a]',
}

interface Props {
  conversation: InboxConversation
  onOpenClient: (clientId: number) => void
  onBack: () => void
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

function MessageBubble({
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
                    className="-mx-1 flex min-w-[240px] items-center gap-3 rounded-[6px] bg-black/5 px-3 py-2.5 hover:bg-black/[0.08]"
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
            className="flex items-center justify-center gap-1.5 rounded-[7.5px] bg-(--wa-bubble-out) px-3 py-2 text-[14px] text-[#027eb5] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
          >
            <CornerUpLeft className="size-4 shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

function Notice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: React.ReactNode }) {
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

export function InboxThread({ conversation, onOpenClient, onBack }: Props) {
  const { data: messages = [], isLoading } = useInboxMessages(conversation.id)
  const { takeover, release, sendMessage, sendMedia, updateContact } = useInboxActions(conversation.id)
  const { containerProps, contentRef, anchorRef, atBottom, unseen, scrollToBottom, scrollToMessage } = useChatScroll(
    messages.length,
  )
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [flashId, setFlashId] = useState<number | null>(null)
  // Opening the chat marks it read, so keep the count it had when it was opened.
  const [unreadAtOpen] = useState(conversation.unreadCount)
  const unreadFromId = firstUnreadId(messages, unreadAtOpen)
  const [text, setText] = useState('')
  const [editingContact, setEditingContact] = useState(false)
  const [windowExpired, setWindowExpired] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  // Detect the 24-hour Meta window: free-text replies are only allowed within
  // 24 h of the last inbound user message. The clock is read asynchronously (in
  // a timer callback, not during render) and re-checked every minute so the
  // banner flips on its own if the window expires while the chat is open.
  useEffect(() => {
    const check = () => {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      setWindowExpired(
        lastUserMsg !== undefined && Date.now() - new Date(lastUserMsg.createdAt).getTime() > TWENTY_FOUR_HOURS_MS,
      )
    }
    const first = setTimeout(check, 0)
    const interval = setInterval(check, 60_000)
    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [messages])

  // Grow the box with its content up to six lines, like WhatsApp's composer.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`
  }, [text])

  const humanAttention = conversation.botPaused || conversation.globalBotDisabled
  const canSend = humanAttention && !windowExpired
  const isSending = sendMessage.isPending

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    sendMessage.mutate(trimmed, {
      onSuccess: () => {
        setText('')
        scrollToBottom()
      },
      onError: error =>
        toast.error(sendFailureMessage(error, 'No se pudo enviar el mensaje por WhatsApp. Probá de nuevo.')),
    })
  }

  /** A search result: scroll to the message and flash it for a moment. */
  function jumpToMessage(messageId: number) {
    // Below 1440 px the panel covers part of the chat: close it to show the message.
    if (window.matchMedia('(max-width: 1439px)').matches) setSearching(false)
    scrollToMessage(messageId)
    setFlashId(messageId)
    setTimeout(() => setFlashId(current => (current === messageId ? null : current)), 1800)
  }

  /** A photo or PDF picked, pasted or dropped: checked, then shown for review. */
  function pickFile(file: File | undefined) {
    if (!file || !canSend) return
    const problem = outgoingFileProblem(file)
    if (problem) toast.error(problem)
    else setAttachment(file)
  }

  function sendAttachment(caption: string) {
    if (!attachment || sendMedia.isPending) return
    sendMedia.mutate(
      { file: attachment, caption },
      {
        onSuccess: () => {
          setAttachment(null)
          scrollToBottom()
        },
        onError: error =>
          toast.error(
            error instanceof ApiError && error.status === 413
              ? 'El archivo supera los 16 MB.'
              : sendFailureMessage(error, 'No se pudo enviar el archivo por WhatsApp. Probá de nuevo.'),
          ),
      },
    )
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const file = e.clipboardData.files[0]
    if (!file) return
    e.preventDefault()
    pickFile(file)
  }

  function insertEmoji(emoji: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    setText(text.slice(0, start) + emoji + text.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  function handleSaveContact(data: UpdateInboxContactRequest) {
    updateContact.mutate(data, {
      onSuccess: () => {
        toast.success('Contacto actualizado')
        setEditingContact(false)
      },
      onError: () => toast.error('No se pudo actualizar el contacto'),
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const client = conversation.client
  const contactName = contactDisplayName(conversation)
  const consulted = consultedClientLabel(conversation)
  const status = conversation.globalBotDisabled
    ? 'Atención humana global'
    : conversation.botPaused
      ? `Atendido por ${conversation.assignedTo?.email ?? 'una persona'}`
      : 'Atiende el bot'
  const subtitle = [status, consulted, hasContactName(conversation) ? formatPhone(conversation.waId) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="relative flex h-full">
      <div
        className="relative flex min-w-0 flex-1 flex-col"
        onDragOver={e => {
          if (!canSend || !e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={e => {
          if (!canSend) return
          e.preventDefault()
          setDragging(false)
          pickFile(e.dataTransfer.files[0])
        }}
      >
        {/* Header */}
        <header className="z-10 flex h-[59px] shrink-0 items-center gap-1 border-l border-(--wa-line) bg-(--wa-panel) px-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a los chats"
            className="-ml-2 mr-1 rounded-full p-1.5 text-(--wa-icon) md:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => (client ? onOpenClient(client.id) : setEditingContact(true))}
            title={client ? 'Ver ficha del asegurado' : 'Editar contacto'}
            className="flex min-w-0 flex-1 items-center gap-[15px] text-left"
          >
            <InboxAvatar className="size-10" />
            <span className="min-w-0">
              <span className="block truncate text-[16px] leading-[21px] text-(--wa-text)">{contactName}</span>
              <span className="block truncate text-[13px] leading-5 text-(--wa-text-2)">{subtitle}</span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-2.5 pl-2">
            {!conversation.globalBotDisabled && !conversation.botPaused && (
              <button
                type="button"
                onClick={() => takeover.mutate()}
                disabled={takeover.isPending}
                className="flex h-9 items-center gap-1.5 rounded-full bg-(--wa-green) px-4 text-[14px] font-medium text-white transition-colors hover:bg-(--wa-green-dark) disabled:opacity-60"
              >
                {takeover.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                Tomar
              </button>
            )}
            <button
              type="button"
              onClick={() => setSearching(open => !open)}
              aria-label="Buscar en la conversación"
              title="Buscar en la conversación"
              className={cn('rounded-full p-2 text-(--wa-icon) hover:bg-black/5', searching && 'bg-black/10')}
            >
              <Search className="size-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Opciones del chat"
                className="rounded-full p-2 text-(--wa-icon) outline-none hover:bg-black/5 data-[state=open]:bg-black/10"
              >
                <MoreVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="wa w-auto min-w-52">
                {client && (
                  <DropdownMenuItem onSelect={() => onOpenClient(client.id)}>
                    <IdCard className="size-4" /> Ver ficha del asegurado
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => setEditingContact(true)}>
                  <Pencil className="size-4" /> Editar contacto
                </DropdownMenuItem>
                {conversation.botPaused && !conversation.globalBotDisabled && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => release.mutate()} disabled={release.isPending}>
                      <UserX className="size-4" /> Devolver al bot
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages */}
        <div className="wa-wallpaper relative min-h-0 flex-1">
          <div {...containerProps} className="h-full overflow-y-auto">
            <div ref={contentRef} className="flex flex-col px-[5%] pb-3 pt-2 lg:px-[7%]">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-(--wa-icon)" />
                </div>
              )}
              {!isLoading && messages.length === 0 && <Notice>Todavía no hay mensajes en esta conversación.</Notice>}
              {messages.map((msg, i) => {
                const prev = messages[i - 1]
                const newDay = !prev || !isSameDay(prev.createdAt, msg.createdAt)
                const unreadStart = msg.id === unreadFromId
                const first = newDay || unreadStart || prev.role !== msg.role
                return (
                  <Fragment key={msg.id}>
                    {newDay && (
                      <div className="sticky top-2 z-[1] mb-1 mt-3 flex justify-center">
                        <span className="rounded-[7.5px] bg-(--wa-surface) px-3 py-[5px] text-[12.5px] leading-[21px] text-(--wa-text-2) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                          {dayLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    {unreadStart && (
                      <div ref={anchorRef} className="mt-3 flex justify-center bg-white/35 py-1.5">
                        <span className="rounded-full bg-(--wa-surface) px-3 py-1 text-[12.5px] text-(--wa-text-2) shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
                          {unreadAtOpen === 1 ? '1 mensaje no leído' : `${unreadAtOpen} mensajes no leídos`}
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={msg}
                      first={first}
                      highlight={searching || flashId !== null ? query : ''}
                      flash={msg.id === flashId}
                    />
                  </Fragment>
                )
              })}
              {windowExpired && humanAttention && (
                <Notice tone="warning">
                  El cliente no escribe hace más de 24 h. WhatsApp no permite enviarle un mensaje libre hasta que vuelva
                  a escribir.
                </Notice>
              )}
            </div>
          </div>

          {!atBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              aria-label="Ir al último mensaje"
              className="absolute bottom-4 right-5 flex size-[42px] items-center justify-center rounded-full bg-(--wa-surface) text-(--wa-icon) shadow-[0_1px_1px_rgba(11,20,26,0.06),0_2px_5px_rgba(11,20,26,0.2)]"
            >
              <ChevronDown className="size-6" />
              {unseen > 0 && (
                <span className="absolute -top-1.5 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--wa-unread) px-1 text-[11px] font-semibold text-white">
                  {unseen}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Composer */}
        {humanAttention ? (
          <footer className="shrink-0 bg-(--wa-panel)">
            {conversation.globalBotDisabled && (
              <p className="px-5 pt-2 text-center text-[12.5px] text-(--wa-text-2)">
                La atención humana global está activa: podés responder sin tomar este chat.
              </p>
            )}
            <div className="flex min-h-[62px] items-end gap-2 px-4 py-[10px]">
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!canSend}
                  aria-label="Emojis"
                  className="mb-[3px] rounded-full p-1.5 text-(--wa-icon) outline-none hover:bg-black/5 disabled:opacity-40 data-[state=open]:bg-black/10"
                >
                  <Smile className="size-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-auto p-2"
                  onCloseAutoFocus={e => e.preventDefault()}
                >
                  <div className="grid grid-cols-9 gap-0.5">
                    {EMOJIS.map(emoji => (
                      <DropdownMenuItem
                        key={emoji}
                        onSelect={() => insertEmoji(emoji)}
                        className="flex size-9 items-center justify-center p-0 text-[22px]"
                      >
                        {emoji}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canSend}
                aria-label="Adjuntar foto o PDF"
                title="Adjuntar foto o PDF"
                className="mb-[3px] rounded-full p-1.5 text-(--wa-icon) hover:bg-black/5 disabled:opacity-40"
              >
                <Paperclip className="size-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={OUTGOING_FILE_ACCEPT}
                className="hidden"
                onChange={e => {
                  pickFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <textarea
                ref={inputRef}
                onPaste={handlePaste}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!canSend || isSending}
                placeholder={windowExpired ? 'No se puede escribir: pasaron más de 24 h' : 'Escribí un mensaje'}
                rows={1}
                className="min-h-[42px] flex-1 resize-none rounded-lg bg-(--wa-surface) px-3 py-[10px] text-[15px] leading-[22px] text-(--wa-text) outline-none placeholder:text-(--wa-text-2) disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend || !text.trim() || isSending}
                aria-label="Enviar"
                className={cn(
                  'mb-px flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
                  text.trim() && canSend ? 'bg-(--wa-green) text-white hover:bg-(--wa-green-dark)' : 'text-(--wa-icon)',
                  'disabled:cursor-not-allowed',
                )}
              >
                {isSending ? <Loader2 className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
              </button>
            </div>
          </footer>
        ) : (
          <footer className="flex min-h-[62px] shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-(--wa-panel) px-4 py-3 text-center">
            <span className="text-[14px] text-(--wa-text-2)">El bot está atendiendo este chat.</span>
            <button
              type="button"
              onClick={() => takeover.mutate()}
              disabled={takeover.isPending}
              className="flex items-center gap-1.5 text-[14px] font-medium text-(--wa-green-dark) hover:underline disabled:opacity-60"
            >
              {takeover.isPending && <Loader2 className="size-4 animate-spin" />}
              Tomar la conversación para escribir
            </button>
          </footer>
        )}

        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-(--wa-panel)/90">
            <span className="rounded-xl border-2 border-dashed border-(--wa-green) px-8 py-6 text-[16px] text-(--wa-text)">
              Soltá la foto o el PDF para enviarlo
            </span>
          </div>
        )}

        {attachment && (
          <InboxAttachmentPreview
            key={`${attachment.name}-${attachment.lastModified}`}
            file={attachment}
            sending={sendMedia.isPending}
            onCancel={() => setAttachment(null)}
            onSend={sendAttachment}
          />
        )}

        {editingContact && (
          <InboxContactDialog
            conversation={conversation}
            saving={updateContact.isPending}
            onClose={() => setEditingContact(false)}
            onSave={handleSaveContact}
          />
        )}
      </div>

      {searching && (
        <InboxSearchPanel
          messages={messages}
          query={query}
          onQueryChange={setQuery}
          onSelect={jumpToMessage}
          onClose={() => setSearching(false)}
        />
      )}
    </div>
  )
}
