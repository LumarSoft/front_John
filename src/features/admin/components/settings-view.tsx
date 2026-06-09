'use client'

import { useState, type FormEvent } from 'react'
import { KeyRound, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { ApiError } from '@/src/lib/api-client'
import type { UpdateProfileRequest } from '@/src/types/api/auth'
import { useProfile } from '../hooks/use-profile'
import { useUpdateProfile } from '../hooks/use-update-profile'

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

export function SettingsView() {
  const { data: profile, isLoading, isError } = useProfile()

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Configuración</div>
        <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Mi cuenta</h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Gestioná tus credenciales de acceso al panel.</p>
      </div>

      {isLoading && (
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
      )}
      {isError && <p className="text-[14px] text-destructive">No se pudo cargar tu perfil.</p>}
      {profile && <SettingsForm key={profile.id} initialEmail={profile.email} />}
    </div>
  )
}
