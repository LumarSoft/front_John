'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, PlugZap, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import type { TriunfoCredentialStatus } from '@/src/types/api/triunfo'
import { useOrganizationTriunfo, useOrganizationTriunfoActions } from '../hooks/use-organization-triunfo'

function statusLine(status: TriunfoCredentialStatus): { ok: boolean; text: string } {
  if (status.configured) {
    const when = status.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString('es-AR') : null
    return {
      ok: true,
      text: `Usuario ${status.username} · productor ${status.productor}${when ? ` · validado el ${when}` : ''}`,
    }
  }
  if (status.usesDefaultSettings) return { ok: true, text: 'Usa las credenciales del servidor (TRIUNFO_*).' }
  return {
    ok: false,
    text: 'Sin credenciales: no cotiza, no sincroniza su cartera y no baja documentos de Triunfo.',
  }
}

/**
 * OWNER: the organization's own Triunfo web-service access. Every quote, cartera
 * sync and document of the organization goes out with it; it is only saved
 * once Triunfo accepts it.
 */
export function OrganizacionTriunfo({ orgId }: { orgId: number }) {
  const { data: status, isLoading } = useOrganizationTriunfo(orgId)
  const { save, remove } = useOrganizationTriunfoActions(orgId)
  const [productor, setProductor] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate(
      { productor: productor.trim(), username: username.trim(), password },
      {
        onSuccess: () => {
          toast.success('Triunfo aceptó las credenciales')
          setPassword('')
        },
        onError: error =>
          toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar. Intentá de nuevo.'),
      },
    )
  }

  if (isLoading || !status) return <Skeleton className="h-40" />
  const line = statusLine(status)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-semibold text-ink">Integración con Triunfo</h2>
      <Card className="flex flex-col gap-5 p-5">
        <p className={`flex items-start gap-2 text-[13px] ${line.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
          {line.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          {line.text}
        </p>

        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="triunfo-productor" className="text-[11px]">
              Código de productor
            </Label>
            <Input
              id="triunfo-productor"
              inputMode="numeric"
              required
              value={productor}
              onChange={e => setProductor(e.target.value)}
              placeholder={status.productor ?? 'Ej: 10484'}
              className="h-9 w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="triunfo-usuario" className="text-[11px]">
              Usuario del web service
            </Label>
            <Input
              id="triunfo-usuario"
              required
              autoComplete="off"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={status.username ?? 'Usuario'}
              className="h-9 w-48"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="triunfo-password" className="text-[11px]">
              Contraseña
            </Label>
            <Input
              id="triunfo-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-9 w-48"
            />
          </div>
          <Button type="submit" size="sm" className="h-9" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
            {status.configured ? 'Reemplazar y validar' : 'Validar y guardar'}
          </Button>
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
        </form>
        <p className="text-[12px] text-muted-foreground">
          Se validan con Triunfo antes de guardarse y la contraseña queda cifrada: nunca se vuelve a mostrar.
        </p>
      </Card>
    </section>
  )
}
