'use client'

import { useState } from 'react'
import { ListTodo, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { cn } from '@/src/lib/utils'
import type { Task, TaskView } from '@/src/types/api/tasks'
import { useProfile } from '../hooks/use-profile'
import { useTaskActions } from '../hooks/use-task-actions'
import { useTaskPeople, useTasks, useTaskStats } from '../hooks/use-tasks'
import { useTaskVisit } from '../hooks/use-task-visit'
import { personName } from '../lib/tasks-format'
import { TaskCard } from './task-card'
import { TaskFormDialog } from './task-form-dialog'

const VIEWS: { key: TaskView; label: string; superAdminOnly?: boolean }[] = [
  { key: 'mine', label: 'Para mí' },
  { key: 'created', label: 'Las que asigné' },
  { key: 'all', label: 'Todo el equipo', superAdminOnly: true },
]

export function TasksView() {
  const { data: profile } = useProfile()
  const isSuperAdmin = profile?.role === 'SUPERADMIN'
  const [view, setView] = useState<TaskView>('mine')
  const [status, setStatus] = useState<'open' | 'done'>('open')
  const [personId, setPersonId] = useState<number | ''>('')
  const [editing, setEditing] = useState<Task | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const { data: tasks, isLoading, isError } = useTasks({ view, status })
  const { data: people = [] } = useTaskPeople()
  const { data: stats } = useTaskStats()
  const { remove } = useTaskActions()
  const newIds = useTaskVisit(tasks, view === 'mine' && status === 'open')

  const visible = (tasks ?? []).filter(task => view === 'mine' || personId === '' || task.assignedTo.id === personId)
  // A new task goes to whoever is being looked at, else to someone else of the office.
  const defaultAssigneeId =
    personId !== '' ? personId : (people.find(person => person.id !== profile?.id)?.id ?? profile?.id)

  function confirmDelete() {
    if (!deleteTarget) return
    remove.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Tarea eliminada')
        setDeleteTarget(null)
      },
      onError: () => toast.error('No se pudo eliminar la tarea'),
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <ListTodo className="size-5 text-ember-2" />
            Tareas
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Lo que el equipo se deja para hacer: llamados para devolver, envíos y pendientes que no pasan por el bot.
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="size-4" /> Nueva tarea
        </Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-2 p-3">
          <div className="flex gap-0.5 rounded-lg bg-secondary/70 p-0.5">
            {VIEWS.filter(item => !item.superAdminOnly || isSuperAdmin).map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setView(item.key)
                  setPersonId('')
                }}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                  view === item.key ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-ink-3',
                )}
              >
                {item.label}
                {item.key === 'mine' && (stats?.open ?? 0) > 0 && (
                  <span className="rounded-full bg-ember-soft px-1.5 text-[11px] tabular-nums text-ember-2">
                    {stats?.open}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-0.5 rounded-lg bg-secondary/70 p-0.5">
            {(['open', 'done'] as const).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                  status === key ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-ink-3',
                )}
              >
                {key === 'open' ? 'Por hacer' : 'Hechas'}
              </button>
            ))}
          </div>

          {view !== 'mine' && (
            <select
              aria-label="Filtrar por persona"
              value={personId}
              onChange={e => setPersonId(e.target.value ? Number(e.target.value) : '')}
              className="h-9 rounded-md border border-line-2 bg-card px-2 text-[13px] text-ink"
            >
              <option value="">Todas las personas</option>
              {people.map(person => (
                <option key={person.id} value={person.id}>
                  {personName(person)}
                </option>
              ))}
            </select>
          )}
        </div>

        {isError ? (
          <p role="alert" className="p-10 text-center text-destructive">
            No se pudieron cargar las tareas.
          </p>
        ) : isLoading ? (
          <p className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando tareas…
          </p>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[14px] text-ink-3">
              {status === 'done'
                ? 'Todavía no hay tareas hechas.'
                : view === 'mine'
                  ? 'No tenés tareas pendientes.'
                  : 'No hay tareas pendientes.'}
            </p>
            {status === 'open' && (
              <Button variant="outline" className="mt-4" onClick={() => setEditing('new')}>
                <Plus className="size-4" /> Dejar una tarea
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isNew={view === 'mine' && (newIds.has(task.id) || task.seenAt === null)}
                unseenByAssignee={view !== 'mine' && task.seenAt === null && task.assignedTo.id !== profile?.id}
                canDelete={task.createdBy.id === profile?.id || isSuperAdmin}
                onEdit={() => setEditing(task)}
                onDelete={() => setDeleteTarget(task)}
              />
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <TaskFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          task={editing === 'new' ? undefined : editing}
          people={people}
          defaultAssigneeId={defaultAssigneeId}
          onClose={() => setEditing(null)}
        />
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && !remove.isPending && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.title}» con sus respuestas. Si ya está resuelta, mejor marcala como hecha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Sí, eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
