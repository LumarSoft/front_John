'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { cn } from '@/src/lib/utils'
import type { Task, TaskPerson } from '@/src/types/api/tasks'
import { useTaskActions } from '../hooks/use-task-actions'
import { dueDay, personName, today, tomorrow } from '../lib/tasks-format'

interface Props {
  /** The task to edit; omitted to create one. */
  task?: Task
  people: TaskPerson[]
  /** Who a new task is for by default. */
  defaultAssigneeId?: number
  onClose: () => void
}

const fieldClass =
  'w-full rounded-md border border-line-2 bg-background px-3 py-2 text-[14px] text-ink outline-none placeholder:text-muted-foreground focus:border-ember focus:ring-[3px] focus:ring-ember/15'

export function TaskFormDialog({ task, people, defaultAssigneeId, onClose }: Props) {
  const { create, update } = useTaskActions()
  const [assigneeId, setAssigneeId] = useState<number | ''>(task?.assignedTo.id ?? defaultAssigneeId ?? '')
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ? dueDay(task.dueDate) : '')
  const [contactName, setContactName] = useState(task?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(task?.contactPhone ?? '')
  const saving = create.isPending || update.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (assigneeId === '' || !title.trim()) return
    const data = {
      title,
      description,
      assignedToUserId: assigneeId,
      dueDate: dueDate || null,
      contactName,
      contactPhone,
    }
    const onError = () => toast.error('No se pudo guardar la tarea. Probá de nuevo.')
    if (task) {
      update.mutate(
        { id: task.id, data },
        {
          onSuccess: () => {
            toast.success('Tarea actualizada')
            onClose()
          },
          onError,
        },
      )
    } else {
      create.mutate(data, {
        onSuccess: created => {
          toast.success(`Tarea para ${personName(created.assignedTo)} creada`)
          onClose()
        },
        onError,
      })
    }
  }

  const quickDates = [
    { label: 'Hoy', value: today() },
    { label: 'Mañana', value: tomorrow() },
    { label: 'Sin fecha', value: '' },
  ]

  return (
    <Dialog open onOpenChange={open => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>{task ? 'Editar tarea' : 'Nueva tarea'}</DialogTitle>
            <DialogDescription>
              Un llamado para devolver, algo para enviar o cualquier pendiente que no pasa por el bot.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-assignee">Para</Label>
              <select
                id="task-assignee"
                required
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value ? Number(e.target.value) : '')}
                className={cn(fieldClass, 'h-10 py-0')}
              >
                <option value="" disabled>
                  Elegí a quién
                </option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>
                    {personName(person)}
                    {person.name ? ` (${person.email})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-title">Qué hay que hacer</Label>
              <Input
                id="task-title"
                required
                autoFocus
                maxLength={200}
                placeholder="Llamar a Pérez por la renovación del Gol"
                className="h-10"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-description">
                Detalle <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <textarea
                id="task-description"
                rows={3}
                maxLength={5000}
                placeholder="Llamó a las 10, quiere pasar a todo riesgo."
                className={cn(fieldClass, 'resize-y')}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-due">Para cuándo</Label>
              <div className="flex flex-wrap items-center gap-2">
                {quickDates.map(option => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setDueDate(option.value)}
                    className={cn(
                      'h-8 rounded-full border px-3 text-[13px] transition-colors',
                      dueDate === option.value
                        ? 'border-ember bg-ember-soft text-ember-2'
                        : 'border-line-2 text-muted-foreground hover:border-ember/50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className={cn(fieldClass, 'h-8 w-auto py-0 text-[13px]')}
                />
              </div>
            </div>

            <fieldset className="flex flex-col gap-2 rounded-lg border border-line-2 p-3">
              <legend className="flex items-center gap-1.5 px-1 text-[13px] font-medium text-ink">
                <Phone className="size-3.5" /> Si viene de un llamado{' '}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  aria-label="Nombre de quien llamó"
                  maxLength={120}
                  placeholder="Quién llamó"
                  className="h-9"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                />
                <Input
                  aria-label="Teléfono para devolver el llamado"
                  type="tel"
                  maxLength={40}
                  placeholder="Teléfono"
                  className="h-9"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                />
              </div>
            </fieldset>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || assigneeId === '' || !title.trim()}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {task ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
