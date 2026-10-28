import { WEEKDAYS, type Weekday, type WeeklySchedule } from '@/src/types/api/business-hours'

/** The first day with a shift that does not end after it starts, or null when every shift is valid. */
export function firstInvalidDay(weekly: WeeklySchedule): Weekday | null {
  return WEEKDAYS.find(day => weekly[day].some(range => range.from >= range.to)) ?? null
}

const otherOpenDays = (weekly: WeeklySchedule, day: Weekday): Weekday[] =>
  WEEKDAYS.filter(other => other !== day && weekly[other].length > 0)

/** Whether every other open day already has exactly the shifts of `day` (or no other day is open). */
export function sameShiftsOnOpenDays(weekly: WeeklySchedule, day: Weekday): boolean {
  const shifts = JSON.stringify(weekly[day])
  return otherOpenDays(weekly, day).every(other => JSON.stringify(weekly[other]) === shifts)
}

/** The schedule with the shifts of `day` repeated on every other open day; closed days stay closed. */
export function copyDayToOpenDays(weekly: WeeklySchedule, day: Weekday): WeeklySchedule {
  const copied = Object.fromEntries(
    otherOpenDays(weekly, day).map(other => [other, weekly[day].map(range => ({ ...range }))]),
  )
  return { ...weekly, ...copied }
}
