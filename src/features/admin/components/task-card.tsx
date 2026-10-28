'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Check,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Phone,
  SendHorizontal,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { cn } from '@/src/lib/utils'
import { TASK_STATUS_LABEL, type Task, type TaskStatus } from '@/src/types/api/tasks'
import { useTaskActions } from '../hooks/use-task-actions'
import { dueLabel, personName, shortDateTime } from '../lib/tasks-format'

interface Props {
  task: Task
  /** Shown as new: unseen by its assignee when the list was opened. */
  isNew: boolean
  /** In the lists of tasks I assigned: its person hasn't looked at it yet. */
  unseenByAssignee: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  PENDING: 'border-line-2 bg-card text-ink-3',
  IN_PROGRESS: 'border-amber/40 bg-amber-subtle text-amber-700 dark:text-amber',
  DONE: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400',
}

export function TaskCard({ task, isNew, unseenByAssignee, canDelete, onEdit, onDelete }: Props) {
  const { update, comment } = useTaskActions()
  const [showComments, setShowComments] = useState(isNew && task.comments.length > 0)
  const [reply, setReply] = useState('')
  const done = task.status === 'DONE'
  // "Novedad" when the latest reply is someone else's, "Nueva" for a task not yet seen.
  const lastComment = task.comments.at(-1)
  const replyFromOthers = lastComment !== undefined && lastComment.user.id !== task.assignedTo.id
  const due = task.dueDate && !done ? dueLabel(task.dueDate) : null

  function setStatus(status: TaskStatus) {
    update.mutate(
      { id: task.id, data: { status } },
      {
        onSuccess: () => {
          if (status === 'DONE') toast.success('Tarea hecha')
        },
        onError: () => toast.error('No se pudo cambiar el estado'),
      },
    )
  }

  function sendReply() {
    const body = reply.trim()
    if (!body || comment.isPending) return
    comment.mutate(
      { id: task.id, body },
      {
        onSuccess: () => setReply(''),
        onError: () => toast.error('No se pudo enviar la respuesta'),
      },
    )
  }

  return (
    <li className={cn('flex gap-3 p-4', isNew && 'bg-ember-soft/30')}>
      <button
        type="button"
        onClick={() => setStatus(done ? 'PENDING' : 'DONE')}
        disabled={update.isPending}
        aria-label={done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        title={done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-line-2 text-transparent hover:border-emerald-500 hover:text-emerald-500',
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('text-[15px] font-semibold text-ink', done && 'text-muted-foreground line-through')}>
              {isNew && (
                <span className="mr-2 inline-flex rounded-full bg-ember px-2 py-0.5 align-middle text-[10.5px] font-semibold uppercase tracking-wide text-on-ember">
                  {replyFromOthers ? 'Novedad' : 'Nueva'}
                </span>
              )}
              {task.title}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Para <span className="font-medium text-ink-3">{personName(task.assignedTo)}</span> · de{' '}
              {personName(task.createdBy)} · {shortDateTime(task.createdAt)}
              {done && task.completedAt && ` · hecha ${shortDateTime(task.completedAt)}`}
              {unseenByAssignee && !done && (
                <span className="text-amber-700 dark:text-amber"> · todavía no la vio</span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <select
              aria-label={`Estado de ${task.title}`}
              value={task.status}
              disabled={update.isPending}
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className={cn('h-8 rounded-full border px-2.5 text-[12px] font-medium', STATUS_STYLE[task.status])}
            >
              {(Object.keys(TASK_STATUS_LABEL) as TaskStatus[]).map(status => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Opciones de ${task.title}`}
                className="rounded-full p-1.5 text-muted-foreground outline-none hover:bg-secondary data-[state=open]:bg-secondary"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-40">
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil className="size-4" /> Editar
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                    <Trash2 className="size-4" /> Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="mt-2 max-w-3xl whitespace-pre-wrap break-words text-[13.5px] text-ink-3">{task.description}</p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px]">
          {due && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                due.overdue
                  ? 'text-destructive'
                  : due.soon
                    ? 'text-amber-700 dark:text-amber'
                    : 'text-muted-foreground',
              )}
            >
              <CalendarDays className="size-3.5" />
              {due.overdue ? `Vencida: ${due.text}` : due.text}
            </span>
          )}
          {(task.contactName || task.contactPhone) && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Phone className="size-3.5" />
              {task.contactName}
              {task.contactName && task.contactPhone && ' · '}
              {task.contactPhone && (
                <a href={`tel:${task.contactPhone.replace(/[^\d+]/g, '')}`} className="text-ember-2 hover:underline">
                  {task.contactPhone}
                </a>
              )}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowComments(open => !open)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-ember-2"
          >
            <MessageSquare className="size-3.5" />
            {task.comments.length === 0
              ? 'Responder'
              : task.comments.length === 1
                ? '1 respuesta'
                : `${task.comments.length} respuestas`}
          </button>
        </div>

        {showComments && (
          <div className="mt-3 max-w-3xl rounded-lg border border-line-2 bg-secondary/30 p-3">
            {task.comments.length > 0 && (
              <ul className="mb-3 flex flex-col gap-2.5">
                {task.comments.map(item => (
                  <li key={item.id} className="text-[13px]">
                    <span className="font-medium text-ink">{personName(item.user)}</span>{' '}
                    <span className="text-[11.5px] text-muted-foreground">{shortDateTime(item.createdAt)}</span>
                    <p className="whitespace-pre-wrap break-words text-ink-3">{item.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    sendReply()
                  }
                }}
                maxLength={2000}
                placeholder="Escribí una respuesta: «Ya lo llamé», «Me falta el DNI»…"
                className="h-9 min-w-0 flex-1 rounded-md border border-line-2 bg-card px-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-ember"
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={!reply.trim() || comment.isPending}
                aria-label="Enviar respuesta"
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ember text-on-ember disabled:opacity-40"
              >
                {comment.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
