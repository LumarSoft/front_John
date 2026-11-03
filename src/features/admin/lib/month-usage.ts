import type { BillingOverview } from '@/src/types/api/billing'

/** One number's month in the sidebar summary. */
export interface NumberUsage {
  id: number
  number: string
  used: number
  included: number
  percent: number
}

/** The month of the user's active numbers, added up: what the sidebar bar shows. */
export interface MonthUsage {
  /** The month's name ("octubre"). */
  monthLabel: string
  used: number
  included: number
  remaining: number
  /** Used over included, 0-100 (the bar never goes past full). */
  percent: number
  /** A number is at 80% of its plan or more. */
  nearLimit: boolean
  /** Numbers whose assistant is paused at their plan's limit. */
  paused: number
  numbers: NumberUsage[]
}

/** The share at which a bar turns to the warning colour, as in Facturación. */
export const NEAR_LIMIT_PERCENT = 80

const monthLabel = (period: string): string => {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'long' })
}

const percentOf = (used: number, included: number): number =>
  included > 0 ? Math.min(100, Math.round((used / included) * 100)) : 0

/** Adds up the active numbers of the billing overview; null when the user has none. */
export function summarizeMonth(overview: BillingOverview): MonthUsage | null {
  const numbers = overview.numbers
    .filter(n => n.isActive)
    .map(n => ({
      id: n.id,
      number: n.number,
      used: n.messagesUsed,
      included: n.includedMessages,
      percent: percentOf(n.messagesUsed, n.includedMessages),
    }))
  if (numbers.length === 0) return null
  const used = numbers.reduce((sum, n) => sum + n.used, 0)
  const included = numbers.reduce((sum, n) => sum + n.included, 0)
  return {
    monthLabel: monthLabel(overview.period),
    used,
    included,
    remaining: Math.max(0, included - used),
    percent: percentOf(used, included),
    nearLimit: numbers.some(n => n.percent >= NEAR_LIMIT_PERCENT),
    paused: overview.numbers.filter(n => n.isActive && n.limit?.paused).length,
    numbers,
  }
}
