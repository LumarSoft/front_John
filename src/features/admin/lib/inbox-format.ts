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
