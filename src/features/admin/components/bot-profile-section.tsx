'use client'

import { useState, type FormEvent } from 'react'
import { Building2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import type { BotProfile, UpdateBotProfileRequest } from '@/src/types/api/config'
import { useBotProfile, useUpdateBotProfile } from '../hooks/use-bot-profile'

type FieldKey = keyof BotProfile

export interface FieldSpec {
  key: FieldKey
  label: string
  placeholder: string
  maxLength: number
  hint?: string
  type?: 'text' | 'email'
}

export interface FieldGroup {
  title: string
  description: string
  fields: FieldSpec[]
}

/** The organization's profile fields, also used for a number's own data. */
export const BOT_PROFILE_GROUPS: FieldGroup[] = [
  {
    title: 'Cómo se presenta',
    description: 'El nombre de la productora con el que el asistente saluda y responde.',
    fields: [
      {
        key: 'orgName',
        label: 'Nombre de la productora',
        placeholder: 'Ej: Seguros Norte',
        maxLength: 120,
        hint: 'Vacío: se usa el nombre de la organización.',
      },
      { key: 'orgShortName', label: 'Sigla', placeholder: 'Ej: SN', maxLength: 30 },
      {
        key: 'orgLegalName',
        label: 'Razón social',
        placeholder: 'Ej: Seguros Norte SRL',
        maxLength: 160,
        hint: 'La que usa la IA para decir para quién trabaja.',
      },
    ],
  },
  {
    title: 'Asistencia y denuncias',
    description: 'Los teléfonos que el asistente da cuando piden una grúa o quieren denunciar por teléfono.',
    fields: [
      {
        key: 'towTruckPhone',
        label: 'Grúa / auxilio (24 hs)',
        placeholder: 'Ej: 0800-555-1234',
        maxLength: 40,
        hint: 'Vacío: el asistente dice que está confirmando el número y ofrece un asesor.',
      },
      {
        key: 'claimsPhone',
        label: 'Línea de denuncias',
        placeholder: '0810-666-0302',
        maxLength: 40,
        hint: 'Vacío: la de Triunfo Seguros.',
      },
      {
        key: 'claimsEmail',
        label: 'Correo que recibe cada denuncia nueva',
        placeholder: 'siniestros@tuproductora.com.ar',
        maxLength: 254,
        type: 'email',
      },
    ],
  },
  {
    title: 'Pagos',
    description: 'Lo que el asistente responde cuando preguntan cómo o dónde pagar una cuota.',
    fields: [
      {
        key: 'cashPaymentPlaces',
        label: 'Dónde se paga en efectivo con el cupón',
        placeholder: 'Rapipago o Pago Fácil',
        maxLength: 200,
        hint: 'Vacío: “Rapipago o Pago Fácil”.',
      },
      {
        key: 'transferAlias',
        label: 'Alias para transferir',
        placeholder: 'Ej: SEGUROS.NORTE.PAGOS',
        maxLength: 60,
        hint: 'Sin alias ni CBU, el asistente dice que la oficina pasa los datos.',
      },
      { key: 'transferCbu', label: 'CBU', placeholder: '22 dígitos', maxLength: 30 },
      { key: 'transferHolder', label: 'Titular de la cuenta', placeholder: 'Ej: Seguros Norte SRL', maxLength: 160 },
      { key: 'transferBank', label: 'Banco', placeholder: 'Ej: Banco Macro', maxLength: 80 },
    ],
  },
]

const ALL_FIELDS = BOT_PROFILE_GROUPS.flatMap(g => g.fields.map(f => f.key))

function toDraft(profile: BotProfile): Record<FieldKey, string> {
  return Object.fromEntries(ALL_FIELDS.map(key => [key, profile[key] ?? ''])) as Record<FieldKey, string>
}

function BotProfileForm({ profile, canEdit }: { profile: BotProfile; canEdit: boolean }) {
  const update = useUpdateBotProfile()
  const initial = toDraft(profile)
  const [draft, setDraft] = useState(initial)

  const changes: UpdateBotProfileRequest = Object.fromEntries(
    ALL_FIELDS.filter(key => draft[key].trim() !== initial[key].trim()).map(key => [key, draft[key].trim()]),
  )
  const hasChanges = Object.keys(changes).length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    update.mutate(changes, {
      onSuccess: () => toast.success('Datos de la productora actualizados'),
      onError: error =>
        toast.error(
          error instanceof ApiError && error.status === 400
            ? `Revisá los datos: ${error.message}`
            : 'No se pudo guardar. Intentá de nuevo.',
        ),
    })
  }

  return (
    <Card className="max-w-xl border-line-2 shadow-sm">
      <form onSubmit={handleSubmit} className="contents">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-[18px]">
            <Building2 className="size-4 text-ember-2" />
            Datos de la productora
          </CardTitle>
          <CardDescription>
            Lo que el asistente le dice a tus clientes y que es propio de tu productora. Los cambios se aplican en el
            próximo mensaje.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-7">
          {BOT_PROFILE_GROUPS.map(group => (
            <fieldset key={group.title} className="flex flex-col gap-4" disabled={!canEdit}>
              <div>
                <legend className="text-[13.5px] font-semibold text-ink">{group.title}</legend>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{group.description}</p>
              </div>
              {group.fields.map(field => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={`profile-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`profile-${field.key}`}
                    type={field.type ?? 'text'}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    className="h-10"
                    value={draft[field.key]}
                    onChange={e => setDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                  {field.hint && <p className="text-[12px] text-muted-foreground">{field.hint}</p>}
                </div>
              ))}
            </fieldset>
          ))}
        </CardContent>
        <CardFooter>
          {canEdit ? (
            <Button type="submit" disabled={!hasChanges || update.isPending} className="h-10">
              {update.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          ) : (
            <p className="text-[12px] text-muted-foreground">Sólo un SuperAdmin puede cambiar estos datos.</p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

/** Configuración → Asistente: the organization's own name, lines and payment data for the bot. */
export function BotProfileSection({ canEdit }: { canEdit: boolean }) {
  const { data: profile, isError } = useBotProfile()

  if (isError) return <p className="text-[14px] text-destructive">No se pudieron cargar los datos de la productora.</p>
  if (!profile)
    return (
      <Card className="max-w-xl border-line-2">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  return <BotProfileForm key={JSON.stringify(profile)} profile={profile} canEdit={canEdit} />
}
