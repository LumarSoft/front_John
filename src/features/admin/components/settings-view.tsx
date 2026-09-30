'use client'

import { useState, type FormEvent } from 'react'
import {
  Bot,
  Clock,
  KeyRound,
  Loader2,
  Mail,
  Power,
  PowerOff,
  ShieldAlert,
  ShieldCheck,
  Tags,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog'
import { ApiError } from '@/src/lib/api-client'
import type { UpdateProfileRequest } from '@/src/types/api/auth'
import { useProfile } from '../hooks/use-profile'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { useProducerConfig } from '../hooks/use-producer-config'
import { useUpdateProducerConfig } from '../hooks/use-update-producer-config'
import { useSetBotStatus } from '../hooks/use-set-bot-status'
import { useRole } from '../hooks/use-role'
import { PricingPlansSection } from './pricing-plans-section'
import { BusinessHoursSection } from './business-hours-section'
import { CoverageSettingsSection } from './coverage-settings-section'

function SettingsForm({ initialEmail }: { initialEmail: string }) {
  const updateProfile = useUpdateProfile()

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')

  const hasChanges = email !== initialEmail || password.length > 0

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const data: UpdateProfileRequest = {}
    if (email !== initialEmail) data.email = email
    if (password) data.password = password
    if (!data.email && !data.password) return

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
          <CardDescription>Actualizá tu correo electrónico y contraseña de acceso.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
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

function BotConfigForm({ initialName }: { initialName: string }) {
  const updateConfig = useUpdateProducerConfig()
  const [botName, setBotName] = useState(initialName)

  const hasChanges = botName.trim() !== initialName.trim()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return

    updateConfig.mutate(
      { botName: botName.trim() },
      {
        onSuccess: () => toast.success('Nombre del asistente actualizado'),
        onError: () => toast.error('No se pudo guardar. Intentá de nuevo.'),
      },
    )
  }

  const preview = botName.trim()
    ? `Soy ${botName.trim()}, el asistente de John Pellegrini Management Group`
    : 'Soy el asistente de John Pellegrini Management Group (JPMG)'

  return (
    <Card className="max-w-xl border-line-2 shadow-sm">
      <form onSubmit={handleSubmit} className="contents">
        <CardHeader>
          <CardTitle className="font-display text-[18px]">Asistente de WhatsApp</CardTitle>
          <CardDescription>
            Elegí el nombre con el que el bot se presenta. Si lo dejás vacío, se presenta como “el asistente de JPMG”.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
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
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!hasChanges || updateConfig.isPending} className="h-10">
            {updateConfig.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : (
              'Guardar nombre'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function BotStatusControl({ botEnabled, canManage }: { botEnabled: boolean; canManage: boolean }) {
  const setStatus = useSetBotStatus()

  const updateBotEnabled = (nextBotEnabled: boolean) => {
    setStatus.mutate(nextBotEnabled, {
      onSuccess: () =>
        toast.success(
          nextBotEnabled
            ? 'La atención humana global se desactivó y el bot volvió a responder'
            : 'La atención humana global quedó activa en todos los chats',
        ),
      onError: () => toast.error('No se pudo cambiar el estado del bot. Intentá de nuevo.'),
    })
  }

  return (
    <>
      <Card className={botEnabled ? 'max-w-xl border-line-2 shadow-sm' : 'max-w-xl border-destructive/40 shadow-sm'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-[18px]">
                {botEnabled ? (
                  <Power className="size-4 text-emerald-600" />
                ) : (
                  <PowerOff className="size-4 text-destructive" />
                )}
                Atención humana global
              </CardTitle>
              <CardDescription className="mt-1.5">
                Este control afecta todos los chats de WhatsApp de la organización.
              </CardDescription>
            </div>
            <span
              className={
                botEnabled
                  ? 'rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'
                  : 'rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive'
              }
            >
              {botEnabled ? 'INACTIVA' : 'ACTIVA'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 rounded-lg border border-line-2 bg-secondary/30 p-3 text-[12.5px] leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ember-2" />
            <p>
              Al activar esta modalidad, los mensajes y fotos siguen entrando a la bandeja, pero el bot no responde, no
              avanza flujos ni envía avisos automáticos. Los chats tomados por una persona conservan su estado.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 sm:flex-row sm:items-center">
          {canManage ? (
            botEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={setStatus.isPending}>
                    <PowerOff className="size-4" />
                    Activar para todos los chats
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Activar la atención humana en todos los chats?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El corte es inmediato. El bot dejará de responder en todas las conversaciones y los asesores
                      podrán contestar sin tomar cada chat por separado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={() => updateBotEnabled(false)}>
                      Sí, tomar todos los chats
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button type="button" onClick={() => updateBotEnabled(true)} disabled={setStatus.isPending}>
                {setStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
                Desactivar atención global y reactivar el bot
              </Button>
            )
          ) : (
            <p className="text-[12px] text-muted-foreground">Sólo un SuperAdmin puede cambiar este estado.</p>
          )}
        </CardFooter>
      </Card>
    </>
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
  const { isSuperAdmin } = useRole()

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
          {profile && <SettingsForm key={profile.id} initialEmail={profile.email} />}
        </TabsContent>

        <TabsContent value="asistente" className="mt-6">
          {config ? (
            <div className="space-y-5">
              <BotStatusControl botEnabled={config.botEnabled} canManage={isSuperAdmin} />
              <BotConfigForm key={config.botName ?? 'no-name'} initialName={config.botName ?? ''} />
            </div>
          ) : (
            <FormSkeleton />
          )}
        </TabsContent>

        <TabsContent value="horarios" className="mt-6">
          <BusinessHoursSection />
        </TabsContent>

        <TabsContent value="coberturas" className="mt-6">
          <CoverageSettingsSection />
        </TabsContent>

        <TabsContent value="precios" className="mt-6">
          <PricingPlansSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
