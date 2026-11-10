'use client'

import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import type { MotoCoverage } from '@/src/types/api/coverage-settings'
import { useMotoCoverages, useUpdateMotoCoverage } from '../hooks/use-coverage-settings'
import { SuperAdminOnlyNote } from './super-admin-only-note'

/**
 * The motorcycle catalog: four coverages with Triunfo's own names and texts,
 * where the office only chooses which ones it offers. Kept apart from the car
 * coverages because the same code is another product on a moto.
 */
export function MotoCoverageSettingsSection({ canEdit }: { canEdit: boolean }) {
  const { data: coverages, isLoading, isError } = useMotoCoverages()
  const update = useUpdateMotoCoverage()

  const toggle = (coverage: MotoCoverage) => {
    update.mutate(
      { code: coverage.code, isActive: !coverage.isActive },
      {
        onSuccess: () => toast.success(coverage.isActive ? 'Cobertura de motos oculta' : 'Cobertura de motos visible'),
        onError: () => toast.error('No se pudo cambiar la visibilidad'),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coberturas de motos</CardTitle>
        <CardDescription>
          Las motos se cotizan con estas cuatro coberturas, con los nombres y textos de Triunfo. Acá solo se elige
          cuáles ve el cliente, aparte de las de automotor: ocultar una acá no cambia la del auto que lleva la misma
          letra.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {!canEdit && <SuperAdminOnlyNote />}
        <fieldset disabled={!canEdit} className="contents">
          {isLoading && (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          )}

          {isError && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No se pudieron cargar las coberturas de motos.
            </p>
          )}

          {coverages?.map(coverage => (
            <div
              key={coverage.code}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
                coverage.isActive ? 'bg-card' : 'bg-muted/40 opacity-70'
              }`}
            >
              <Badge variant="outline" className="font-mono">
                {coverage.code}
              </Badge>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{coverage.name}</span>
                  {!coverage.isActive && <Badge variant="outline">Oculta</Badge>}
                </div>
                {coverage.tagline && <p className="text-muted-foreground truncate text-xs">{coverage.tagline}</p>}
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggle(coverage)}
                disabled={update.isPending}
                aria-label={
                  coverage.isActive ? `Ocultar ${coverage.name} en motos` : `Mostrar ${coverage.name} en motos`
                }
              >
                {coverage.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </Button>
            </div>
          ))}
        </fieldset>
      </CardContent>
    </Card>
  )
}
