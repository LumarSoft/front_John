'use client'

import { useBillingOverview } from '../hooks/use-billing'
import { useRole } from '../hooks/use-role'
import { PlanLimitActions } from './plan-limit-actions'

/** Inicio: every number of the user whose assistant is paused at its plan's limit, with the choice. */
export function PlanLimitAlerts() {
  const { role, isOwner } = useRole()
  const { data } = useBillingOverview(undefined, !!role && !isOwner)
  const paused = data?.numbers.filter(n => n.limit?.paused) ?? []
  if (paused.length === 0) return null
  return (
    <div className="mt-6 flex flex-col gap-3">
      {paused.map(row => (
        <PlanLimitActions key={row.id} row={row} showNumber />
      ))}
    </div>
  )
}
