const pad = (n: number): string => String(n).padStart(2, '0')

export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Parse at local midnight — new Date('YYYY-MM-DD') would shift the day in negative UTC offsets
export const parseISODate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const todayISO = (): string => toISODate(new Date())

export const addDaysISO = (iso: string, days: number): string => {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export const addYearsISO = (iso: string, years: number): string => {
  const date = parseISODate(iso)
  date.setFullYear(date.getFullYear() + years)
  return toISODate(date)
}

export const formatDisplayDate = (iso: string): string =>
  parseISODate(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
