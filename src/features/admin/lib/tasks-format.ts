import type { TaskPerson } from '@/src/types/api/tasks'

/** "Mili", or the part of the email before the @ when no name was set. */
export function personName(person: TaskPerson): string {
  return person.name?.trim() || person.email.split('@')[0]
}

function localDay(offsetDays = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Today and tomorrow as YYYY-MM-DD, for the quick due-date buttons. */
export const today = (): string => localDay(0)
export const tomorrow = (): string => localDay(1)

/** "2026-10-14T00:00:00.000Z" → "2026-10-14". */
export function dueDay(iso: string): string {
  return iso.slice(0, 10)
}

/** "Hoy", "Mañana", "Ayer" or "mié 15 oct", plus whether it is already late. */
export function dueLabel(iso: string): { text: string; overdue: boolean; soon: boolean } {
  const day = dueDay(iso)
  const now = today()
  if (day === now) return { text: 'Hoy', overdue: false, soon: true }
  if (day === tomorrow()) return { text: 'Mañana', overdue: false, soon: true }
  if (day === localDay(-1)) return { text: 'Ayer', overdue: true, soon: false }
  const text = new Date(`${day}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return { text, overdue: day < now, soon: false }
}

/** "13 oct, 14:05". */
export function shortDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}
