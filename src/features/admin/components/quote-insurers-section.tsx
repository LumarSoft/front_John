'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import type { QuoteInsurer, QuoteInsurerState } from '@/src/types/api/config'
import { useQuoteInsurers, useUpdateQuoteInsurers } from '../hooks/use-quote-insurers'
import { PanelSwitch } from './panel-switch'

const INSURERS: Array<{ key: QuoteInsurer; name: string; whenOff: string }> = [
  {
    key: 'triunfo',
    name: 'Triunfo',
    whenOff: 'Apagada, el bot no cotiza autos ni motos: toma el pedido y un asesor contacta al cliente.',
  },
  {
    key: 'sancor',
    name: 'Sancor',
    whenOff: 'Apagada, el bot ofrece los planes cargados en Precios o toma el pedido para un asesor.',
  },
]

/** The refusal only repeats what the warning above already lists (a missing code, no credentials). */
function repeatsProblems(error: string, problems: string[]): boolean {
  return problems.length > 0 && problems.every(problem => error.includes(problem))
}

function InsurerRow({
  name,
  whenOff,
  state,
  canEdit,
  busy,
  error,
  onChange,
}: {
  name: string
  whenOff: string
  state: QuoteInsurerState
  canEdit: boolean
  busy: boolean
  error: string | null
  onChange: (on: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[15px] font-medium text-ink">
            {name}
            {busy && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {state.enabled ? 'Encendida' : 'Apagada'} · cotiza {state.products.join(', ').toLowerCase()}
          </p>
        </div>
        <PanelSwitch
          on={state.enabled}
          label={`Cotizar con ${name}`}
          disabled={!canEdit}
          busy={busy}
          onChange={onChange}
        />
      </div>
      {!state.enabled && <p className="text-[12.5px] text-muted-foreground">{whenOff}</p>}
      {state.problems.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <ul className="flex flex-col gap-0.5">
            {state.problems.map(problem => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
      {error && !repeatsProblems(error, state.problems) && <p className="text-[12.5px] text-destructive">{error}</p>}
    </div>
  )
}

/**
 * "Configuración → Aseguradoras": which insurers the organization's bot quotes
 * with. Turning one on makes the API ask that insurer for a token with the
 * organization's credentials; when it cannot, the switch stays off and says why.
 */
export function QuoteInsurersSection({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading, isError } = useQuoteInsurers()
  const update = useUpdateQuoteInsurers()
  const [pending, setPending] = useState<QuoteInsurer | null>(null)
  const [errors, setErrors] = useState<Partial<Record<QuoteInsurer, string>>>({})

  const change = (key: QuoteInsurer, name: string, on: boolean) => {
    setPending(key)
    setErrors(current => ({ ...current, [key]: undefined }))
    update.mutate(
      { [key]: on },
      {
        onSuccess: () => toast.success(on ? `${name} encendida: el token salió bien` : `${name} apagada para el bot`),
        onError: error => {
          const message =
            error instanceof ApiError && error.status < 500
              ? error.message
              : `No se pudo contactar a ${name}. Probá de nuevo en un rato.`
          setErrors(current => ({ ...current, [key]: message }))
          toast.error(`${name} sigue apagada`)
        },
        onSettled: () => setPending(null),
      },
    )
  }

  return (
    <Card className="max-w-xl border-line-2 shadow-sm">
      <CardHeader>
        <CardTitle className="font-display text-[18px]">Aseguradoras con las que cotiza el bot</CardTitle>
        <CardDescription>
          Al encender una, primero se le pide un token con las credenciales de la organización. Si falta algo o la
          aseguradora lo rechaza, queda apagada y acá se ve por qué.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-24 w-full" />}
        {isError && <p className="text-[14px] text-destructive">No se pudieron cargar las aseguradoras.</p>}
        {data && (
          <div className="flex flex-col divide-y divide-line-2">
            {INSURERS.map(insurer => (
              <InsurerRow
                key={insurer.key}
                name={insurer.name}
                whenOff={insurer.whenOff}
                state={data[insurer.key]}
                canEdit={canEdit}
                busy={pending === insurer.key}
                error={errors[insurer.key] ?? null}
                onChange={on => change(insurer.key, insurer.name, on)}
              />
            ))}
          </div>
        )}
        {!canEdit && (
          <p className="mt-4 text-[12px] text-muted-foreground">
            Es de toda la organización: solo el SuperAdmin enciende o apaga las aseguradoras.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
