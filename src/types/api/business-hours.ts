export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
}

/** A single HH:mm–HH:mm opening range (24h). */
export interface TimeRange {
  from: string
  to: string
}

/** Per-day ranges; an empty array means closed that day. */
export type WeeklySchedule = Record<Weekday, TimeRange[]>

/** A day or range a number is closed (a holiday, vacations). Each number has its own. */
export interface Closure {
  id: number
  startDate: string // YYYY-MM-DD
  endDate: string
  reason: string
  /** A national holiday loaded by the daily sync; false for one the office added. */
  holiday: boolean
}

/** The organization's weekly hours: those of every number without its own. */
export interface BusinessHoursConfig {
  weekly: WeeklySchedule
}

export interface UpdateScheduleRequest {
  weekly: WeeklySchedule
}

export interface CreateClosureRequest {
  startDate: string
  endDate: string
  reason: string
}
