'use client'

import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import { useOrganizationTriunfo, useOrganizationTriunfoActions } from '../hooks/use-organization-triunfo'
import { TriunfoCredentialForm, TriunfoCredentialStatusView } from './triunfo-credential-form'

/**
 * OWNER: the organization's own Triunfo web-service access. Every quote, cartera
 * sync and document of the organization goes out with it; it is only saved
 * once Triunfo accepts it.
 */
export function OrganizacionTriunfo({ orgId }: { orgId: number }) {
  const { data: status, isLoading } = useOrganizationTriunfo(orgId)
  const { save, remove, setQuoteFallback } = useOrganizationTriunfoActions(orgId)

  if (isLoading || !status) return <Skeleton className="h-40" />

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-semibold text-ink">Integración con Triunfo</h2>
      <Card className="flex flex-col gap-5 p-5">
        <TriunfoCredentialStatusView status={status} audience="owner" />

        <TriunfoCredentialForm status={status} save={save}>
          {status.configured && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(undefined, {
                  onSuccess: () => toast.success('Credenciales de Triunfo quitadas'),
                  onError: () => toast.error('No se pudieron quitar. Intentá de nuevo.'),
                })
              }
            >
              Quitar
            </Button>
          )}
        </TriunfoCredentialForm>

        {!status.configured && !status.usesDefaultSettings && (
          <div className="flex flex-col gap-1 border-t border-line-2 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                className="size-4 accent-ember-2"
                checked={status.quoteFallback ?? false}
                disabled={setQuoteFallback.isPending}
                onChange={e =>
                  setQuoteFallback.mutate(e.target.checked, {
                    onSuccess: next =>
                      toast.success(
                        next.quoteFallback
                          ? 'Cotiza con la cuenta principal hasta tener la propia'
                          : 'Ya no cotiza con la cuenta principal',
                      ),
                    onError: error =>
                      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar. Intentá de nuevo.'),
                  })
                }
              />
              Cotizar con la cuenta principal mientras llegan sus credenciales
            </label>
            <p className="text-[12px] text-muted-foreground">
              Provisorio. Las cotizaciones de autos y motos de esta organización salen con la cuenta de Triunfo de la
              organización principal y quedan registradas en Triunfo a su nombre. La cartera y los documentos siguen
              esperando las credenciales propias. Se desactiva solo al guardarlas.
            </p>
          </div>
        )}
      </Card>
    </section>
  )
}
