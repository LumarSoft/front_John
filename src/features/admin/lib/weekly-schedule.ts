import { WEEKDAYS, type Weekday, type WeeklySchedule } from '@/src/types/api/business-hours'

/** The first day with a shift that does not end after it starts, or null when every shift is valid. */
export function firstInvalidDay(weekly: WeeklySchedule): Weekday | null {
  return WEEKDAYS.find(day => weekly[day].some(range => range.from >= range.to)) ?? null
}
