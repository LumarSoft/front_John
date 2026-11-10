'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Bot,
  Building2,
  CalendarOff,
  Check,
  CircleAlert,
  CircleCheck,
  Clock,
  FileText,
  Inbox,
  Info,
  Landmark,
  Lightbulb,
  ListTodo,
  Loader2,
  ShieldAlert,
  Sparkles,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'
import type { AssistantAction, AssistantActionStatus } from '@/src/types/api/assistant'

const ICONS: Record<string, LucideIcon> = {
  datos_de_pago: Landmark,
  datos_productora: Building2,
  horarios: Clock,
  bot_numero: Bot,
  cierre: CalendarOff,
  tarea: ListTodo,
  asunto: Inbox,
  siniestro: ShieldAlert,
  solicitud: FileText,
  mejora: Lightbulb,
}

/** A pending card past its time counts as expired, even before the API is asked again. */
function statusOf(action: AssistantAction): AssistantActionStatus {
  return action.status === 'pending' && new Date(action.expiresAt).getTime() <= Date.now() ? 'expired' : action.status
}

interface AssistantActionCardProps {
  action: AssistantAction
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
  /** Asks the assistant to prepare going back on this change; unset while it is answering. */
  onUndo?: () => void
  onNavigate: () => void
}

/**
 * A change the assistant prepared: what it touches, before → after, who else
 * it reaches, and the buttons. Nothing changes until "Confirmar".
 */
export function AssistantActionCard({
  action,
  busy,
  onConfirm,
  onCancel,
  onUndo,
  onNavigate,
}: AssistantActionCardProps) {
  const reduced = useReducedMotion()
  const status = statusOf(action)
  const { preview } = action
  const Icon = ICONS[action.type] ?? Sparkles
  const settled = status !== 'pending'

  return (
    <motion.div
      layout={!reduced}
      initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'overflow-hidden rounded-xl border bg-card text-[12.5px] shadow-sm',
        status === 'pending' ? 'border-ember-ring' : 'border-line-2',
      )}
    >
      <div className="flex items-start gap-3 px-3.5 pt-3.5">
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg',
            settled ? 'bg-secondary text-muted-foreground' : 'bg-ember-soft text-ember-2',
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] leading-snug font-semibold text-ink">{preview.title}</p>
          <p className="truncate text-[12px] text-muted-foreground">{preview.target}</p>
        </div>
      </div>

      {preview.changes.length > 0 && (
        <dl className="mx-3.5 mt-3 divide-y divide-line rounded-lg border border-line bg-secondary/40">
          {preview.changes.map(change => (
            <div key={change.label} className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-3 px-3 py-2">
              <dt className="text-muted-foreground">{change.label}</dt>
              <dd className="min-w-0">
                {change.before !== null && change.before !== change.after && (
                  <span className="block break-words text-faint line-through decoration-faint/60">{change.before}</span>
                )}
                <span
                  className={cn(
                    'block break-words',
                    change.after === null ? 'text-faint italic' : 'font-medium text-ink',
                  )}
                >
                  {change.after ?? 'Vacío'}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      {preview.notes.length > 0 && (
        <ul className="mx-3.5 mt-2.5 flex flex-col gap-1">
          {preview.notes.map(note => (
            <li key={note} className="flex gap-1.5 text-[12px] leading-snug text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        {status === 'pending' && (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-secondary/30 px-3.5 py-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy} className="h-8">
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={onConfirm} disabled={busy} className="h-8 gap-1.5">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              {preview.confirmLabel}
            </Button>
          </div>
        )}
        {status === 'confirmed' && (
          <div className="flex flex-col gap-1.5 border-t border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <p className="flex items-start gap-2">
              <CircleCheck className="mt-px size-4 shrink-0" />
              <span>{action.summary ?? 'Listo.'}</span>
            </p>
            {(action.link || (action.undoable && onUndo)) && (
              <div className="flex items-center justify-end gap-1">
                {action.link && (
                  <Link
                    href={action.link.route}
                    onClick={onNavigate}
                    className="rounded-md px-1.5 py-0.5 font-medium underline underline-offset-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                  >
                    {action.link.label}
                  </Link>
                )}
                {action.undoable && onUndo && (
                  <button
                    type="button"
                    onClick={onUndo}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                    title="Pedirle al asistente que lo deje como estaba"
                  >
                    <Undo2 className="size-3.5" />
                    Deshacer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {status === 'failed' && (
          <div className="flex items-start gap-2 border-t border-red-200 bg-red-50 px-3.5 py-2.5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <CircleAlert className="mt-px size-4 shrink-0" />
            <span>{action.error ?? 'No se pudo aplicar el cambio.'}</span>
          </div>
        )}
        {status === 'cancelled' && (
          <p className="border-t border-line px-3.5 py-2.5 text-muted-foreground">Cancelada: no se cambió nada.</p>
        )}
        {status === 'expired' && (
          <p className="border-t border-line px-3.5 py-2.5 text-muted-foreground">
            Venció sin confirmarse: pedile al asistente que la arme de nuevo.
          </p>
        )}
      </div>
    </motion.div>
  )
}
