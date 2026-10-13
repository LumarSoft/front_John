import type { InboxMessage } from '@/src/types/api/inbox'

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function daysAgo(date: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((start(new Date()) - start(date)) / 86_400_000)
}

export function isSameDay(a: string, b: string): boolean {
  return dayKey(new Date(a)) === dayKey(new Date(b))
}

export function messageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

/** Chat list stamp, as WhatsApp shows it: time today, "Ayer", weekday this week, else the date. */
export function listTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const days = daysAgo(date)
  if (days <= 0) return messageTime(iso)
  if (days === 1) return 'Ayer'
  if (days < 7) return date.toLocaleDateString('es-AR', { weekday: 'long' })
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Separator between days in the thread. */
export function dayLabel(iso: string): string {
  const date = new Date(iso)
  const days = daysAgo(date)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) {
    const weekday = date.toLocaleDateString('es-AR', { weekday: 'long' })
    return weekday[0].toUpperCase() + weekday.slice(1)
  }
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Text the bot stores in place of a media message ("[imagen]", "[El cliente
 * envió una foto]"): it describes the attachment, it is not a caption.
 */
export function isMediaPlaceholder(content: string): boolean {
  return /^\[[^\]]*\]$/.test(content.trim())
}

export function senderLabel(role: InboxMessage['role']): string {
  if (role === 'agent') return 'Asesor'
  if (role === 'assistant') return 'Bot'
  return 'Cliente'
}

const REPLY_BUTTONS_LINE = /^(\[[^\]\n]+\]\s*)+$/

/**
 * The bot stores a message with reply buttons as its body plus a last line
 * like "[Sí, soy cliente] [Todavía no]". Splitting them lets the thread draw
 * the buttons under the bubble, as WhatsApp does.
 */
export function splitReplyButtons(content: string): { body: string; buttons: string[] } {
  const newline = content.lastIndexOf('\n')
  const lastLine = content.slice(newline + 1).trim()
  if (newline === -1 || !REPLY_BUTTONS_LINE.test(lastLine)) return { body: content, buttons: [] }
  const buttons = [...lastLine.matchAll(/\[([^\]\n]+)\]/g)].map(m => m[1].trim())
  return { body: content.slice(0, newline).trimEnd(), buttons }
}

/** List preview text: without WhatsApp markup or the trailing reply buttons. */
export function plainPreview(content: string): string {
  return content
    .replace(/(\s*\[[^\]]+\])+$/, '')
    .replace(/([*_~])([^\s*_~](?:[^*_~]*[^\s*_~])?)\1/g, '$2')
    .trim()
}

/** Id of the oldest of the last `unreadCount` customer messages: where the unread divider goes. */
export function firstUnreadId(messages: InboxMessage[], unreadCount: number): number | null {
  if (unreadCount <= 0) return null
  let remaining = unreadCount
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== 'user') continue
    remaining--
    if (remaining === 0) return messages[i].id
  }
  return null
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_PDF_BYTES = 16 * 1024 * 1024

/** File types the panel can send through WhatsApp, for the file picker. */
export const OUTGOING_FILE_ACCEPT = 'image/jpeg,image/png,application/pdf'

/** Why a file can't be sent, or null when it can (same limits as the API). */
export function outgoingFileProblem(file: File): string | null {
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    return file.size > MAX_PHOTO_BYTES ? 'WhatsApp acepta fotos de hasta 5 MB.' : null
  }
  if (file.type === 'application/pdf') {
    return file.size > MAX_PDF_BYTES ? 'El PDF no puede superar los 16 MB.' : null
  }
  return 'Solo se pueden enviar fotos JPG o PNG y archivos PDF.'
}

/** 48213 → "47 kB". */
export function fileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/**
 * Lowercase without accents, one character per character of the input, so a
 * match found in the folded text points at the same place in the original.
 */
export function foldText(text: string): string {
  let folded = ''
  for (const char of text) {
    const plain = char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    folded += plain.length === char.length ? plain : char.toLowerCase().padEnd(char.length).slice(0, char.length)
  }
  return folded
}

export interface MessageSearchHit {
  message: InboxMessage
  /** Text around the first match, for the results list. */
  snippet: string
}

const MIN_SEARCH_LENGTH = 2
const SNIPPET_CONTEXT = 40

function searchableText(message: InboxMessage): string {
  const content = isMediaPlaceholder(message.content) ? '' : message.content
  return [content, message.media?.originalName ?? ''].filter(Boolean).join(' · ')
}

/** Messages that contain the query, newest first, ignoring case and accents. */
export function searchMessages(messages: InboxMessage[], query: string): MessageSearchHit[] {
  const needle = foldText(query.trim())
  if (needle.length < MIN_SEARCH_LENGTH) return []
  const hits: MessageSearchHit[] = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = searchableText(messages[i]).replace(/\s+/g, ' ')
    const at = foldText(text).indexOf(needle)
    if (at === -1) continue
    const start = Math.max(0, at - SNIPPET_CONTEXT)
    const end = Math.min(text.length, at + needle.length + SNIPPET_CONTEXT)
    hits.push({
      message: messages[i],
      snippet: `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`,
    })
  }
  return hits
}

/** Splits text into plain and matching parts, for highlighting a search. */
export function splitByQuery(text: string, query: string): { text: string; match: boolean }[] {
  const needle = foldText(query.trim())
  if (needle.length < MIN_SEARCH_LENGTH) return [{ text, match: false }]
  const folded = foldText(text)
  const parts: { text: string; match: boolean }[] = []
  let last = 0
  let at = folded.indexOf(needle)
  while (at !== -1) {
    if (at > last) parts.push({ text: text.slice(last, at), match: false })
    parts.push({ text: text.slice(at, at + needle.length), match: true })
    last = at + needle.length
    at = folded.indexOf(needle, last)
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false })
  return parts
}
