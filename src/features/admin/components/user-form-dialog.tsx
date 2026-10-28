'use client'

import { useState, type FormEvent } from 'react'
import { Building2, KeyRound, Loader2, Mail, UserPlus } from 'lucide-react'
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
import type { AdminRole, AdminUser } from '@/src/types/api/auth'
import { useCreateUser } from '../hooks/use-create-user'
import { useUpdateUser } from '../hooks/use-update-user'
import { useProducerCodes } from '../hooks/use-producer-codes'

interface UserFormDialogProps {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Hands over to the new-branch onboarding (code, user, number, assistant, plan). */
  onStartBranch?: () => void
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
  const [name, setName] = useState(user?.name ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminRole>(user?.role ?? 'ADMIN')
  const [codeIds, setCodeIds] = useState<number[]>(user?.producerCodes?.map(pc => pc.producerCode.id) ?? [])

  const { data: producerCodes } = useProducerCodes()
  const pending = createUser.isPending || updateUser.isPending

  const toggleCode = (id: number) =>
    setCodeIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // SuperAdmin sees all codes implicitly; only send grants for ADMIN.
    const producerCodeIds = role === 'ADMIN' ? codeIds : []
    if (isEdit) {
      const data = { email, name, role, producerCodeIds, ...(password ? { password } : {}) }
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
        { email, name, password, role, producerCodeIds },
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
          <Label htmlFor="user-name">
            Nombre <span className="text-muted-foreground">(como lo llaman en la oficina)</span>
          </Label>
          <Input
            id="user-name"
            maxLength={80}
            placeholder="Mili"
            className="h-10"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

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

        <div className="flex flex-col gap-2">
          <Label>Rol</Label>
          <div className="grid grid-cols-2 gap-2">
            {(['ADMIN', 'SUPERADMIN'] as AdminRole[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`h-10 rounded-md border text-[13px] font-medium transition-colors ${
                  role === r
                    ? 'border-ember-2 bg-ember-soft text-ember-2'
                    : 'border-line-2 text-ink-3 hover:bg-secondary'
                }`}
              >
                {r === 'SUPERADMIN' ? 'SuperAdmin' : 'Administrador'}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground">
            {role === 'SUPERADMIN'
              ? 'Ve todos los códigos de la organización y administra usuarios.'
              : 'Ve solo los códigos que le asignes abajo.'}
          </p>
        </div>

        {role === 'ADMIN' && (
          <div className="flex flex-col gap-2">
            <Label>Códigos asignados</Label>
            <div className="max-h-44 overflow-y-auto rounded-md border border-line-2 p-2">
              {(producerCodes ?? []).length === 0 && (
                <p className="px-1 py-2 text-[13px] text-muted-foreground">No hay códigos disponibles.</p>
              )}
              {(producerCodes ?? []).map(code => (
                <label
                  key={code.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-ember-2"
                    checked={codeIds.includes(code.id)}
                    onChange={() => toggleCode(code.id)}
                  />
                  <span className="text-[13px] text-ink">
                    <span className="font-medium">{code.code}</span>
                    {code.holderName ? <span className="text-muted-foreground"> · {code.holderName}</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
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

/** The first question for a new user: a branch that already exists, or a new one that gets its own onboarding. */
function BranchChoice({ onExisting, onNew }: { onExisting: () => void; onNew: () => void }) {
  const option =
    'flex flex-col items-start gap-1.5 rounded-lg border border-line-2 p-4 text-left transition-colors hover:border-ember-2 hover:bg-ember-soft/40'
  return (
    <div className="grid gap-3 py-5 sm:grid-cols-2">
      <button type="button" onClick={onExisting} className={option}>
        <UserPlus className="size-5 text-ember-2" />
        <span className="text-[14px] font-medium text-ink">Sucursal existente</span>
        <span className="text-[12px] text-muted-foreground">
          Un usuario más para una sucursal que ya tiene su código y su número.
        </span>
      </button>
      <button type="button" onClick={onNew} className={option}>
        <Building2 className="size-5 text-ember-2" />
        <span className="text-[14px] font-medium text-ink">Sucursal nueva</span>
        <span className="text-[12px] text-muted-foreground">
          Independiente de las demás: su código, su administrador, su número de WhatsApp, cómo atiende el bot y su plan.
        </span>
      </button>
    </div>
  )
}

export function UserFormDialog({ user, open, onOpenChange, onStartBranch }: UserFormDialogProps) {
  const isEdit = !!user
  const [choice, setChoice] = useState<'ask' | 'existing'>('ask')
  const asking = !isEdit && choice === 'ask' && !!onStartBranch

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) setChoice('ask')
        onOpenChange(o)
      }}
    >
      <DialogContent className={asking ? 'sm:max-w-[560px]' : 'sm:max-w-[440px]'}>
        <DialogHeader>
          <DialogTitle className="font-display text-[20px]">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá el correo o la contraseña del administrador.'
              : asking
                ? '¿Para qué sucursal es este usuario?'
                : 'Creá un nuevo administrador de la plataforma.'}
          </DialogDescription>
        </DialogHeader>
        {open && asking && (
          <BranchChoice
            onExisting={() => setChoice('existing')}
            onNew={() => {
              setChoice('ask')
              onOpenChange(false)
              onStartBranch?.()
            }}
          />
        )}
        {open && !asking && (
          <UserForm
            key={user?.id ?? 'new'}
            user={user}
            onDone={() => {
              setChoice('ask')
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
