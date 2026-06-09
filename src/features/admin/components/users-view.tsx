'use client'

import { useState } from 'react'
import { Ellipsis, Plus, ShieldCheck, SquarePen, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import type { AdminUser } from '@/src/types/api/auth'
import { useUsers } from '../hooks/use-users'
import { useProfile } from '../hooks/use-profile'
import { useDeleteUser } from '../hooks/use-delete-user'
import { UserFormDialog } from './user-form-dialog'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersView() {
  const { data: users, isLoading, isError } = useUsers()
  const { data: profile } = useProfile()
  const deleteUser = useDeleteUser()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditing(user)
    setDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const target = deleteTarget
    deleteUser.mutate(target.id, {
      onSuccess: () => {
        toast.success(`${target.email} eliminado`)
        setDeleteTarget(null)
      },
      onError: () => toast.error('No se pudo eliminar el usuario.'),
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Gestión</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            Administradores
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Creá, editá o eliminá los administradores de la plataforma.
          </p>
        </div>
        <Button onClick={openCreate} className="h-10">
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Usuario
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Rol</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:table-cell">
                Alta
              </TableHead>
              <TableHead className="w-12 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto size-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar los usuarios.
                </TableCell>
              </TableRow>
            )}

            {users && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <UserPlus className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">Todavía no hay administradores.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {users?.map((user, index) => {
              const isSelf = user.id === profile?.id
              return (
                <TableRow
                  key={user.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-ember-soft text-[12px] font-semibold text-ember-2">
                          {user.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-ink">{user.email}</span>
                        {isSelf && (
                          <Badge variant="secondary" className="bg-ember-soft text-ember-2">
                            Vos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1 font-normal text-ink-3">
                      <ShieldCheck className="size-3.5 text-ember-2" />
                      Administrador
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-[13px] text-muted-foreground sm:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                            <Ellipsis className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <SquarePen />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={isSelf}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <UserFormDialog user={editing} open={dialogOpen} onOpenChange={setDialogOpen} />

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <span className="font-medium text-ink">{deleteTarget?.email}</span>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                confirmDelete()
              }}
              disabled={deleteUser.isPending}
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30"
            >
              {deleteUser.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
