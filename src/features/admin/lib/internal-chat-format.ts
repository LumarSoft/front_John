import type { InternalChat, InternalChatPerson } from '@/src/types/api/internal-chat'
import { personName } from './tasks-format'

export const INTERNAL_CHAT_PATH = '/admin/chat-interno'

/** Link to the internal chat with a chat already open (the new-message notice). */
export function internalChatHref(chatId: number): string {
  return `${INTERNAL_CHAT_PATH}?chat=${chatId}`
}

export function chatTitle(chat: Pick<InternalChat, 'kind' | 'person'>): string {
  if (chat.kind === 'TEAM') return 'Todo el equipo'
  return chat.person ? personName(chat.person) : 'Chat'
}

/** "MI" for Mili, from the name or the email. */
export function personInitials(person: Pick<InternalChatPerson, 'name' | 'email'>): string {
  const words = personName(person).split(/\s+/).filter(Boolean)
  const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}` : personName(person).slice(0, 2)
  return initials.toUpperCase()
}

function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** The calendar day of a message, to group the chat by day. */
export function messageDay(iso: string): string {
  return localDay(new Date(iso))
}

/** "Hoy", "Ayer" or "lunes 3 de noviembre", for the separators between days. */
export function dayLabel(day: string): string {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (day === localDay(today)) return 'Hoy'
  if (day === localDay(yesterday)) return 'Ayer'
  return new Date(`${day}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** "14:05". */
export function messageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

/** The time for today's messages, "Ayer", or "3/11" in the chat list. */
export function listTime(iso: string): string {
  const day = messageDay(iso)
  const label = dayLabel(day)
  if (label === 'Hoy') return messageTime(iso)
  if (label === 'Ayer') return label
  const date = new Date(iso)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

/** "Mili y Demis", "Mili, Demis y John". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
}
