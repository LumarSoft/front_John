'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Bot, Clock, KeyRound, Loader2, Mail, ShieldCheck, Smartphone, Tags, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { ApiError } from '@/src/lib/api-client'
import type { UpdateProfileRequest } from '@/src/types/api/auth'
import { useProfile } from '../hooks/use-profile'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { useProducerConfig } from '../hooks/use-producer-config'
import { useUpdateProducerConfig } from '../hooks/use-update-producer-config'
import { useRole } from '../hooks/use-role'
import { BotProfileSection } from './bot-profile-section'
import { PricingPlansSection } from './pricing-plans-section'
import { BusinessHoursSection } from './business-hours-section'
import { CoverageSettingsSection } from './coverage-settings-section'
import { SuperAdminOnlyNote } from './super-admin-only-note'
import { splitNames } from '../lib/number-assistant-form'

function SettingsForm({ initialEmail, initialName }: { initialEmail: string; initialName: string }) {
  const updateProfile = useUpdateProfile()

  const [email, setEmail] = useState(initialEmail)
  const [name, setName] = useState(initialName)
  const [password, setPassword] = useState('')

  const hasChanges = email !== initialEmail || name !== initialName || password.length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const data: UpdateProfileRequest = {}
    if (email !== initialEmail) data.email = email
    if (name !== initialName) data.name = name
    if (password) data.password = password
    if (!hasChanges) return

    updateProfile.mutate(data, {
      onSuccess: () => {
        setPassword('')
        toast.success('Cambios guardados')
      },
      onError: error => {
        const message =
          error instanceof ApiError && error.status === 409
            ? 'Ese correo ya está en uso.'
            : 'No se pudo guardar. Intentá de nuevo.'
        toast.error(message)
      },
    })
  }

  return (
    <Card className="max-w-xl border-line-2 shadow-sm">
      <form onSubmit={handleSubmit} className="contents">
        <CardHeader>
          <CardTitle className="font-display text-[18px]">Datos de la cuenta</CardTitle>
          <CardDescription>Tu nombre, tu correo electrónico y tu contraseña de acceso.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-name">
              Nombre <span className="text-muted-foreground">(así te ven en Tareas)</span>
            </Label>
            <Input
              id="settings-name"
              maxLength={80}
              placeholder="Mili"
              className="h-10"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="settings-email"
                type="email"
                required
                placeholder="nombre@gmail.com"
                className="h-10 pl-9"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="settings-password">
              Nueva contraseña <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="settings-password"
                type="password"
                minLength={6}
                autoComplete="new-password"
                placeholder="Dejá en blanco para no cambiarla"
                className="h-10 pl-9"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!hasChanges || updateProfile.isPending} className="h-10">
            {updateProfile.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

/** "Mili, Milagros" → ["Mili", "Milagros"]. */
/** How the bot names the organization: "John Pellegrini Management Group (JPMG)". */
interface OrgNaming {
  name: string
  shortName: string | null
}

/** Reminds an admin that this is the whole organization's; their own number's assistant is in Números. */
function OwnNumberHint() {
  return (
    <div className="flex max-w-xl gap-3 rounded-xl border border-ember-ring bg-ember-soft px-4 py-3 text-[13px] text-ink-3">
      <Smartphone className="mt-0.5 size-4 shrink-0 text-ember-2" />
      <p>
        Esto vale para los números que no tienen lo suyo. El bot se enciende y se apaga en cada número, y cada número
        tiene sus feriados y pausas; también se le puede dar su propio nombre, personas, horario y datos. Todo eso está
        en{' '}
        <Link href="/admin/numeros" className="font-medium text-ember-2 underline-offset-2 hover:underline">
          Números → Asistente
        </Link>
        .
      </p>
    </div>
  )
}

function BotConfigForm({
  initialName,
  initialStaff,
  org,
  canEdit,
}: {
  initialName: string
  initialStaff: string[]
  org: OrgNaming
  canEdit: boolean
}) {
  const updateConfig = useUpdateProducerConfig()
  const [botName, setBotName] = useState(initialName)
  const [staff, setStaff] = useState(initialStaff.join(', '))

  const nameChanged = botName.trim() !== initialName.trim()
  const staffChanged = splitNames(staff).join(',') !== initialStaff.join(',')
  const hasChanges = nameChanged || staffChanged

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    updateConfig.mutate(
      {
        ...(nameChanged ? { botName: botName.trim() } : {}),
        ...(staffChanged ? { staffNames: splitNames(staff) } : {}),
      },
      {
        onSuccess: () => toast.success('Asistente actualizado'),
        onError: () => toast.error('No se pudo guardar. Intentá de nuevo.'),
      },
    )
  }

  const preview = botName.trim()
    ? `Soy ${botName.trim()}, el asistente de ${org.name}`
    : `Soy el asistente de ${org.name}${org.shortName ? ` (${org.shortName})` : ''}`

  return (
    <Card className="max-w-xl border-line-2 shadow-sm">
      <form onSubmit={handleSubmit} className="contents">
        <CardHeader>
          <CardTitle className="font-display text-[18px]">Asistente de WhatsApp</CardTitle>
          <CardDescription>
            Elegí el nombre con el que el bot se presenta. Si lo dejás vacío, se presenta como “el asistente de{' '}
            {org.shortName ?? org.name}”. Vale para todos los números que no tengan uno propio (Números → Asistente).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset disabled={!canEdit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bot-name">Nombre del asistente</Label>
              <div className="relative">
                <Bot className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="bot-name"
                  type="text"
                  maxLength={60}
                  placeholder="Ej: NICO (dejá vacío para no usar nombre)"
                  className="h-10 pl-9"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                />
              </div>
              <p className="text-[12.5px] text-muted-foreground">
                Vista previa: <span className="text-ink">{preview}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="staff-names">Personas de la oficina</Label>
              <Input
                id="staff-names"
                type="text"
                maxLength={200}
                placeholder="Ej: Mili, Milagros"
                className="h-10"
                value={staff}
                onChange={e => setStaff(e.target.value)}
              />
              <p className="text-[12.5px] text-muted-foreground">
                Separados por coma. Si un cliente le escribe a alguien por su nombre (“Hola Mili”), el bot le avisa a
                esa persona en Asuntos pendientes y sigue atendiendo al cliente.
              </p>
            </div>
          </fieldset>
        </CardContent>
        <CardFooter>
          {canEdit ? (
            <Button type="submit" disabled={!hasChanges || updateConfig.isPending} className="h-10">
              {updateConfig.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          ) : (
            <SuperAdminOnlyNote />
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

const TABS = [
  { value: 'cuenta', label: 'Cuenta', icon: UserRound },
  { value: 'asistente', label: 'Asistente', icon: Bot },
  { value: 'horarios', label: 'Horarios', icon: Clock },
  { value: 'precios', label: 'Precios', icon: Tags },
  { value: 'coberturas', label: 'Coberturas', icon: ShieldCheck },
] as const

function FormSkeleton() {
  return (
    <Card className="max-w-xl border-line-2">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function SettingsView() {
  const { data: profile, isLoading, isError } = useProfile()
  const { data: config } = useProducerConfig()
  const { isSuperAdmin, isAdmin } = useRole()
  // Since 28/10 every admin changes the organization settings, not only the SuperAdmin.
  const canEditOrg = isSuperAdmin || isAdmin

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-7">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Configuración</div>
        <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Configuración</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Gestioná tu cuenta, el asistente de WhatsApp, los horarios de atención y los precios.
        </p>
      </div>

      <Tabs defaultValue="cuenta">
        <TabsList variant="line" className="h-auto max-w-full flex-wrap justify-start gap-1">
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 py-1.5 text-[13.5px]">
              <tab.icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cuenta" className="mt-6">
          {isLoading && <FormSkeleton />}
          {isError && <p className="text-[14px] text-destructive">No se pudo cargar tu perfil.</p>}
          {profile && <SettingsForm key={profile.id} initialEmail={profile.email} initialName={profile.name ?? ''} />}
        </TabsContent>

        <TabsContent value="asistente" className="mt-6">
          {config ? (
            <div className="space-y-5">
              <OwnNumberHint />
              <BotConfigForm
                key={`${config.botName ?? ''}|${(config.staffNames ?? []).join(',')}`}
                initialName={config.botName ?? ''}
                initialStaff={config.staffNames ?? []}
                org={{
                  name: profile?.organization?.displayName ?? 'tu productora',
                  shortName: profile?.organization?.shortName ?? null,
                }}
                canEdit={canEditOrg}
              />
              <BotProfileSection canEdit={canEditOrg} />
            </div>
          ) : (
            <FormSkeleton />
          )}
        </TabsContent>

        <TabsContent value="horarios" className="mt-6">
          <BusinessHoursSection canEdit={canEditOrg} />
        </TabsContent>

        <TabsContent value="coberturas" className="mt-6">
          <CoverageSettingsSection canEdit={canEditOrg} />
        </TabsContent>

        <TabsContent value="precios" className="mt-6">
          <PricingPlansSection canEdit={canEditOrg} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
