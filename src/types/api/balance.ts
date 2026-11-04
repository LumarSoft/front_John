/** Metrics the API stores for each month (definitions in api_john src/balance/balance-metrics.ts). */
export type BalanceStoredMetric =
  | 'policiesInForce'
  | 'policiesNew'
  | 'policiesLost'
  | 'premiumInForce'
  | 'debtAmount'
  | 'installmentsOverdue'
  | 'installmentsRejected'
  | 'claimsFiled'
  | 'claimsOpen'
  | 'claimsBlockedNoPolicy'
  | 'claimsBlockedRejectedPayment'
  | 'claimsBlockedOverdue'
  | 'quotesBot'
  | 'quotesWeb'
  | 'quoteRequests'
  | 'contactLeads'
  | 'requestsClosed'
  | 'handoffs'
  | 'conversationsNew'
  | 'messagesSent'
  | 'rejectionNoticesSent'
  | 'expiryNoticesSent'

/** Stored metrics plus the totals the API adds (both quote channels, the three stopped-claim reasons). */
export type BalanceMetricKey = BalanceStoredMetric | 'quotes' | 'claimsBlocked'

export interface BalanceMetricValue {
  /** Null = not recorded that month ("sin dato"). */
  value: number | null
  previous: number | null
  change: number | null
  /** Percent against the month before, 1 decimal; null without a previous value or from 0. */
  changePct: number | null
}

export interface BalanceMonth {
  /** "YYYY-MM" */
  period: string
  /** False = no balance was taken that month. */
  recorded: boolean
  /** Rebuilt after the fact: the month-end state (debt, cuotas, open claims, closed requests, premium) is unknown. */
  backfilled: boolean
  snapshotAt: string | null
  metrics: Record<BalanceMetricKey, BalanceMetricValue>
}

export interface BalanceResponse {
  /** Oldest first, the last one being the month before the current. */
  months: BalanceMonth[]
}

export interface BalanceQuery {
  months?: number
  producerCodeId?: number
  phoneNumberId?: number
}
