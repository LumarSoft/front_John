'use client'

import { Loader2, PauseCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { ApiError } from '@/src/lib/api-client'
import type { BillingNumber } from '@/src/types/api/billing'
import { useResolveLimit } from '../hooks/use-billing'
import { resumeDay } from '../lib/plan-limit'
import { numberLabel } from '../lib/number-label'

const int = (n: number) => n.toLocaleString('es-AR')
const usd = (n: number) => `USD ${n.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`

/**
 * A number whose assistant paused at its plan's limit: continue on the next plan (it answers again) or keep it
 * paused until next month. Shown in Inicio and in its Facturación card.
 */
export function PlanLimitActions({ row, showNumber = false }: { row: BillingNumber; showNumber?: boolean }) {
  const resolve = useResolveLimit()
  if (!row.limit?.paused) return null
  const limit = row.limit

  const choose = (choice: 'continue' | 'pause') =>
    resolve.mutate(
      { numberId: row.id, choice },
      {
        onSuccess: () =>
          toast.success(
            choice === 'continue'
              ? 'Listo: el asistente vuelve a responder'
              : `Queda en pausa hasta el ${resumeDay(row)}`,
          ),
        onError: error =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar la elección', {
            id: `limit-${row.id}`,
          }),
      },
    )

  return (
    <div className="rounded-lg border border-amber/40 bg-amber/10 p-3.5">
      <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink">
        <PauseCircle className="size-4 shrink-0 text-amber" />
        {showNumber ? `El asistente del ${numberLabel(row)} está en pausa` : 'El asistente está en pausa'}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">
        Llegó a los {int(row.includedMessages)} mensajes de su plan {row.plan.name} este mes. Los mensajes se siguen
        guardando y podés contestar desde Whatsapp.{' '}
        {limit.confirmed
          ? `Vuelve a responder solo el ${resumeDay(row)}.`
          : '¿Querés pasarlo al plan siguiente o dejarlo en pausa hasta el mes que viene?'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {row.nextPlan && (
          <Button size="sm" disabled={resolve.isPending} onClick={() => choose('continue')}>
            {resolve.isPending && resolve.variables?.choice === 'continue' && <Loader2 className="animate-spin" />}
            Pasar a {row.nextPlan.name} · {usd(row.nextPlan.priceUsd)} por mes
          </Button>
        )}
        {!limit.confirmed && (
          <Button size="sm" variant="outline" disabled={resolve.isPending} onClick={() => choose('pause')}>
            {resolve.isPending && resolve.variables?.choice === 'pause' && <Loader2 className="animate-spin" />}
            Dejarlo en pausa hasta el {resumeDay(row)}
          </Button>
        )}
      </div>
    </div>
  )
}
