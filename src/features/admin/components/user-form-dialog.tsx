'use client'

import { useState, type FormEvent } from 'react'
import { KeyRound, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { ApiError } from '@/src/lib/api-client'
import type { AdminUser } from '@/src/types/api/auth'
import { useCreateUser } from '../hooks/use-create-user'
import { useUpdateUser } from '../hooks/use-update-user'

interface UserFormDialogProps {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function onMutationError(error: unknown) {
  const message =
    error instanceof ApiError && error.status === 409
      ? 'Ese correo ya está en uso.'
      : 'No se pudo guardar. Intentá de nuevo.'
  toast.error(message)
}

function UserForm({ user, onDone }: { user: AdminUser | null; onDone: () => void }) {
  const isEdit = !!user
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')

  const pending = createUser.isPending || updateUser.isPending

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      const data = { email, ...(password ? { password } : {}) }
      updateUser.mutate(
        { id: user.id, data },
        {
          onSuccess: () => {
            toast.success('Usuario actualizado')
            onDone()
          },
          onError: onMutationError,
        },
      )
    } else {
      createUser.mutate(
        { email, password },
        {
          onSuccess: () => {
            toast.success('Usuario creado')
            onDone()
          },
          onError: onMutationError,
        },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="user-email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="user-email"
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
          <Label htmlFor="user-password">
            Contraseña {isEdit && <span className="text-muted-foreground">(opcional)</span>}
          </Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="user-password"
              type="password"
              required={!isEdit}
              minLength={6}
              placeholder={isEdit ? 'Dejá en blanco para no cambiarla' : 'Mínimo 6 caracteres'}
              className="h-10 pl-9"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Guardando…
            </>
          ) : isEdit ? (
            'Guardar cambios'
          ) : (
            'Crear usuario'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function UserFormDialog({ user, open, onOpenChange }: UserFormDialogProps) {
  const isEdit = !!user

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[20px]">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá el correo o la contraseña del administrador.'
              : 'Creá un nuevo administrador de la plataforma.'}
          </DialogDescription>
        </DialogHeader>
        {open && <UserForm key={user?.id ?? 'new'} user={user} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
