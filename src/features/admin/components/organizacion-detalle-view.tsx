'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, KeyRound, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import { useRole } from '../hooks/use-role'
import { useOrganization, useOrganizationMutations } from '../hooks/use-organizations'
import { BillingSummary, CodesTable, NumbersSection, UsersSection } from './organizacion-secciones'

function errMsg(error: unknown, fallback = 'No se pudo guardar. Intentá de nuevo.') {
  return error instanceof ApiError ? error.message : fallback
}

/** Same page frame every admin view uses, so the tables never touch the edges. */
const PAGE = 'mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10'

/**
 * Full-page detail of one organization.
 *
 * Lives on its own route rather than in a side sheet: the billing cards plus the
 * numbers and codes tables need the whole width to stay readable.
 */
export function OrganizacionDetalleView({ orgId }: { orgId: number }) {
  const { isOwner, isLoading: roleLoading } = useRole()
  const { data: org, isLoading } = useOrganization(Number.isFinite(orgId) ? orgId : null)
  const { addCode, updateCode, setActive } = useOrganizationMutations(orgId)

  const [newCode, setNewCode] = useState('')
  const [newCodeHolder, setNewCodeHolder] = useState('')

  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    if (!newCode.trim()) return
    addCode.mutate(
      { id: orgId, data: { code: newCode.trim(), holderName: newCodeHolder.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success('Código agregado')
          setNewCode('')
          setNewCodeHolder('')
        },
        onError: e2 => toast.error(errMsg(e2)),
      },
    )
  }

  if (!roleLoading && !isOwner) {
    return (
      <div className={PAGE}>
        <Card className="p-6">
          <p className="text-[13px] text-muted-foreground">Esta sección es exclusiva del owner de la plataforma.</p>
        </Card>
      </div>
    )
  }

  if (isLoading || !org) {
    return (
      <div className={`${PAGE} flex flex-col gap-4`}>
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className={`${PAGE} flex flex-col gap-8`}>
      {/* Header */}
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/organizaciones"
          className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Organizaciones
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{org.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">slug: {org.slug}</Badge>
              {org.masterCode && <Badge variant="secondary">master {org.masterCode}</Badge>}
              <Badge variant={org.isActive ? 'secondary' : 'destructive'}>{org.isActive ? 'Activa' : 'Inactiva'}</Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={setActive.isPending}
            onClick={() =>
              setActive.mutate(
                { id: orgId, isActive: !org.isActive },
                {
                  onSuccess: () => toast.success(org.isActive ? 'Organización desactivada' : 'Organización activada'),
                  onError: e => toast.error(errMsg(e)),
                },
              )
            }
          >
            {org.isActive ? 'Desactivar organización' : 'Activar organización'}
          </Button>
        </div>
      </header>

      <BillingSummary billing={org.billing} />

      <NumbersSection numbers={org.numbers} />

      {/* Producer codes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Códigos de productor ({org.codes.length})</h2>

        <form onSubmit={submitCode} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="new-code" className="text-[11px]">
              Código
            </Label>
            <Input
              id="new-code"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              placeholder="8074"
              className="h-9 w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="new-code-holder" className="text-[11px]">
              Titular
            </Label>
            <Input
              id="new-code-holder"
              value={newCodeHolder}
              onChange={e => setNewCodeHolder(e.target.value)}
              placeholder="Nombre (opcional)"
              className="h-9 w-56"
            />
          </div>
          <Button type="submit" size="icon" className="size-9" disabled={addCode.isPending} aria-label="Agregar código">
            <Plus className="size-4" />
          </Button>
        </form>

        <CodesTable
          codes={org.codes}
          toggling={updateCode.isPending}
          onToggle={(codeId, isActive) =>
            updateCode.mutate(
              { id: orgId, codeId, data: { isActive } },
              { onError: () => toast.error('No se pudo actualizar.') },
            )
          }
        />
      </section>

      <UsersSection orgId={orgId} users={org.users} />

      <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <KeyRound className="size-3.5" />
        Los datos de consumo corresponden al período {org.billing.period} y se actualizan a medida que el bot opera.
      </p>
    </div>
  )
}
