'use client'

import { toast } from 'sonner'
import { ApiError } from '@/src/lib/api-client'
import type { OrganizationDetail } from '@/src/types/api/organizations'
import { useOwnerPlans } from '../hooks/use-billing'
import { useOrganizationMutations } from '../hooks/use-organizations'
import { int, usd } from './billing-ui'

/**
 * OWNER: the plan the organization is on. It holds while the organization has
 * no number (the panel functions its users may use) and each of its new
 * numbers starts on it. Nothing is invoiced from it: billing is per number.
 */
export function OrganizacionPlan({ org }: { org: OrganizationDetail }) {
  const { data: catalog } = useOwnerPlans()
  const { setPlan } = useOrganizationMutations(org.id)

  // An API older than the organization's plan: nothing to choose yet.
  if (org.planId === undefined) return null

  const plans = (catalog?.plans ?? []).filter(p => p.isActive || p.id === org.planId)
  const hasNumbers = org.numbers.some(n => n.isActive)
  const automatic = org.planId == null && org.startingPlan ? ` (hoy: ${org.startingPlan.name})` : ''

  const choose = (value: string) => {
    const planId = value === '' ? null : Number(value)
    setPlan.mutate(
      { id: org.id, planId },
      {
        onSuccess: res =>
          toast.success(res.startingPlan ? `Plan de la organización: ${res.startingPlan.name}` : 'Plan actualizado'),
        onError: e => toast.error(e instanceof ApiError ? e.message : 'No se pudo guardar. Intentá de nuevo.'),
      },
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[15px] font-semibold text-ink">Plan</h2>
      <p className="text-[12.5px] text-muted-foreground">
        {hasNumbers
          ? 'Es el plan con el que arranca cada número nuevo. Los números que ya tiene siguen con el suyo.'
          : 'Todavía no tiene números: con este plan sus usuarios ya usan las funciones que incluye, y con él arranca su primer número. No se factura nada hasta que conecte uno.'}
      </p>
      <select
        aria-label="Plan de la organización"
        value={org.planId ?? ''}
        disabled={setPlan.isPending || !catalog}
        onChange={e => choose(e.target.value)}
        className="h-9 w-fit max-w-full rounded-md border border-line-2 bg-transparent px-2 text-[13px] text-ink"
      >
        <option value="">Automático{automatic}</option>
        {plans.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} · {int(p.messages)} mensajes · {usd(p.priceUsd)}
          </option>
        ))}
      </select>
    </section>
  )
}
