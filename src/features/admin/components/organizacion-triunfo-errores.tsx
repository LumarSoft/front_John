'use client'

import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import { useOrganizationTriunfoErrors } from '../hooks/use-organization-triunfo'
import { formatDayTime, TRIUNFO_ERROR_KIND_LABELS, triunfoOperationLabel } from '../lib/triunfo-errors'

/**
 * OWNER: how the organization's calls to Triunfo are failing, one row per
 * distinct failure. A new row is often a change on Triunfo's side (a header
 * it starts requiring, a field it renames).
 */
export function OrganizacionTriunfoErrores({ orgId }: { orgId: number }) {
  const { data: errors, isLoading, isError } = useOrganizationTriunfoErrors(orgId)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-semibold text-ink">Errores de Triunfo</h2>
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <Skeleton className="m-5 h-20" />
        ) : isError ? (
          <p role="alert" className="p-5 text-[13px] text-destructive">
            No se pudieron cargar los errores.
          </p>
        ) : !errors?.length ? (
          <p className="p-5 text-[13px] text-muted-foreground">Ninguna llamada a Triunfo falló todavía.</p>
        ) : (
          <ul className="divide-y divide-line">
            {errors.map(error => (
              <li key={error.id} className="flex flex-col gap-1.5 p-4">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-medium',
                      error.kind === 'CREDENTIALS_REJECTED'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
                    )}
                  >
                    {TRIUNFO_ERROR_KIND_LABELS[error.kind]}
                    {error.httpStatus != null ? ` ${error.httpStatus}` : ''}
                  </span>
                  <span className="text-ink">{triunfoOperationLabel(error.operation)}</span>
                  <span className="ml-auto tabular-nums text-muted-foreground">
                    {error.occurrences} {error.occurrences === 1 ? 'vez' : 'veces'} · primera{' '}
                    {formatDayTime(error.firstSeenAt)} · última {formatDayTime(error.lastSeenAt)}
                  </span>
                </div>
                <p className="break-words text-[13px] text-ink">{error.message}</p>
                {error.sample && (
                  <details className="text-[12px] text-muted-foreground">
                    <summary className="cursor-pointer select-none">Detalle</summary>
                    <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-[11px]">
                      {error.sample}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
