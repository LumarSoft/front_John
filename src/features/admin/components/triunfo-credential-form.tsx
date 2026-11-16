'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import type { UseMutationResult } from '@tanstack/react-query'
import { CheckCircle2, Loader2, LockKeyhole, PlugZap, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ApiError } from '@/src/lib/api-client'
import type { SaveTriunfoCredentialRequest, TriunfoCredentialStatus } from '@/src/types/api/triunfo'
import { formatDayTime } from '../lib/triunfo-errors'
import { md5Hex } from '../lib/md5'

/** Who reads the status: the platform owner, or the organization's own office. */
type Audience = 'owner' | 'office'

function statusLine(status: TriunfoCredentialStatus, audience: Audience): { ok: boolean; text: string } {
  if (status.configured) {
    const when = status.verifiedAt ? new Date(status.verifiedAt).toLocaleDateString('es-AR') : null
    return {
      ok: true,
      text: `Usuario ${status.username} · productor ${status.productor}${when ? ` · validado el ${when}` : ''}`,
    }
  }
  if (status.usesDefaultSettings)
    return {
      ok: true,
      text:
        audience === 'owner'
          ? 'Usa las credenciales del servidor (TRIUNFO_*).'
          : 'Conectado con el acceso que cargó soporte. Si cambiaste la contraseña en TriunfoNet, cargá la nueva acá.',
    }
  if (status.quoteFallback)
    return {
      ok: false,
      text:
        audience === 'owner'
          ? 'Sin credenciales propias: cotiza autos y motos con la cuenta principal, de forma provisoria. No sincroniza su cartera ni baja documentos de Triunfo.'
          : 'Todavía sin acceso propio: las cotizaciones salen de forma provisoria con otra cuenta. La cartera y los documentos esperan tu acceso.',
    }
  return {
    ok: false,
    text:
      audience === 'owner'
        ? 'Sin credenciales: no cotiza, no sincroniza su cartera y no baja documentos de Triunfo.'
        : 'Sin acceso a Triunfo: no se cotiza, no se sincroniza la cartera ni se bajan documentos.',
  }
}

/** Which Triunfo access is in use, and since when Triunfo refuses it. */
export function TriunfoCredentialStatusView({
  status,
  audience,
}: {
  status: TriunfoCredentialStatus
  audience: Audience
}) {
  const line = statusLine(status, audience)
  // Configured is not working: no green check while Triunfo refuses them.
  const healthy = line.ok && !status.failingSince

  return (
    <>
      <p className={`flex items-start gap-2 text-[13px] ${line.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
        {healthy ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : line.ok ? null : (
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        )}
        {line.text}
      </p>

      {status.failingSince && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-semibold">
              Triunfo rechaza estas credenciales desde el {formatDayTime(status.failingSince)}
            </span>
            {status.failureMessage ? `: «${status.failureMessage}»` : ''}. Probablemente cambiaron la contraseña en
            TriunfoNet: cargá la nueva acá abajo y todo vuelve a andar.
          </span>
        </p>
      )}
    </>
  )
}

/**
 * Loads or replaces a Triunfo web-service access. The password is hashed to
 * MD5 here, in the browser, before the request: Triunfo takes it that way, so
 * the password itself is never sent nor stored. `children` are extra actions
 * next to the submit button.
 */
export function TriunfoCredentialForm({
  status,
  save,
  children,
}: {
  status: TriunfoCredentialStatus
  save: UseMutationResult<TriunfoCredentialStatus, Error, SaveTriunfoCredentialRequest>
  children?: ReactNode
}) {
  const [productor, setProductor] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate(
      { productor: productor.trim(), username: username.trim(), password: md5Hex(password) },
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

  return (
    <>
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
        {children}
      </form>

      <div className="flex items-start gap-2 rounded-lg border border-line-2 bg-paper-2 p-3 text-[12px] text-muted-foreground">
        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-ember-2" />
        <div className="flex flex-col gap-1">
          <p>
            <span className="font-medium text-ink">La contraseña no sale de este navegador.</span> Antes de enviarse se
            convierte acá mismo a un código (MD5), que es lo que piden los servicios de Triunfo. De la contraseña solo
            se envía ese código: se valida con Triunfo, queda guardado cifrado y no se vuelve a mostrar.
          </p>
          <p>
            Usá una contraseña larga, de 12 caracteres o más: de una corta se puede deducir la original a partir de su
            código. Después de tres intentos rechazados hay que esperar 15 minutos, para que Triunfo no bloquee el
            acceso.
          </p>
        </div>
      </div>
    </>
  )
}
