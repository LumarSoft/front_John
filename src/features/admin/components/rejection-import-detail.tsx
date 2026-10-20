'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCheck, Eye, Loader2, MessageSquare, Send, Trash2 } from 'lucide-react'
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { ApiError } from '@/src/lib/api-client'
import { cn } from '@/src/lib/utils'
import type { Rejection } from '@/src/types/api/rejections'
import { useRejectionActions, useRejectionImport } from '../hooks/use-rejections'
import { useRejectionSelection } from '../hooks/use-rejection-selection'
import {
  formatDay,
  formatMoment,
  formatMoney,
  formatWaId,
  isOpen,
  paymentMeans,
  statusLabel,
  summarize,
} from '../lib/rejections-format'
import { personName } from '../lib/tasks-format'

type Confirm = 'send' | 'mark' | 'delete' | null

const errorText = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback)

export function RejectionImportDetail({ importId, onDeleted }: { importId: number; onDeleted: () => void }) {
  const { data, isLoading, isError } = useRejectionImport(importId)
  const selection = useRejectionSelection(importId, data?.rows)
  const { send, mark, remove } = useRejectionActions()
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [preview, setPreview] = useState<Rejection | null>(null)
  const busy = send.isPending || mark.isPending || remove.isPending

  if (isError) {
    return (
      <p role="alert" className="p-10 text-center text-destructive">
        No se pudo cargar el Excel.
      </p>
    )
  }
  if (isLoading || !data) {
    return (
      <p className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando rechazos…
      </p>
    )
  }

  const totals = summarize(data.rows)
  const example = selection.toSend[0]

  function runConfirmed() {
    if (confirm === 'send') {
      send.mutate(
        { id: importId, ids: selection.toSend.map(row => row.id) },
        {
          onSuccess: () => {
            toast.success('Enviando los avisos por WhatsApp…')
            setConfirm(null)
          },
          onError: error => toast.error(errorText(error, 'No se pudieron enviar los avisos')),
        },
      )
    } else if (confirm === 'mark') {
      mark.mutate(
        { id: importId, ids: selection.toMark.map(row => row.id) },
        {
          onSuccess: () => {
            toast.success('Marcados como avisados')
            setConfirm(null)
          },
          onError: error => toast.error(errorText(error, 'No se pudieron marcar')),
        },
      )
    } else if (confirm === 'delete') {
      remove.mutate(importId, {
        onSuccess: () => {
          toast.success('Carga eliminada')
          setConfirm(null)
          onDeleted()
        },
        onError: error => toast.error(errorText(error, 'No se pudo eliminar la carga')),
      })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-2 p-4">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-ink">{data.fileName}</h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {data.periodLabel ? `${data.periodLabel} · ` : ''}Cargado por {personName(data.createdBy)} el{' '}
            {formatMoment(data.createdAt)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setConfirm('delete')} disabled={busy || totals.sending > 0}>
          <Trash2 className="size-3.5" /> Eliminar carga
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line-2 px-4 py-3 text-[12.5px]">
        <Chip label="Para enviar" value={totals.ready} strong />
        <Chip label="Avisados" value={totals.sent} />
        {totals.sending > 0 && <Chip label="Enviando" value={totals.sending} />}
        {totals.failed > 0 && <Chip label="No se enviaron" value={totals.failed} />}
        <Chip label="Ya pagadas" value={totals.paid} />
        {totals.notified > 0 && <Chip label="Ya avisados antes" value={totals.notified} />}
        <Chip label="Sin WhatsApp" value={totals.noPhone} />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <Button
          onClick={() => setConfirm('send')}
          disabled={busy || !data.templateReady || selection.toSend.length === 0}
          title={data.templateReady ? undefined : 'La plantilla de WhatsApp todavía no está habilitada'}
        >
          <Send className="size-4" /> Enviar aviso{selection.toSend.length === 1 ? '' : 's'} ({selection.toSend.length})
        </Button>
        <Button variant="outline" onClick={() => setConfirm('mark')} disabled={busy || selection.toMark.length === 0}>
          <CheckCheck className="size-4" /> Marcar como avisados a mano ({selection.toMark.length})
        </Button>
        {totals.sending > 0 && (
          <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Enviando de a uno…
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-[13px]">
          <thead>
            <tr className="border-y border-line-2 bg-secondary/40 text-left text-[11.5px] uppercase tracking-wide text-muted-foreground">
              <th className="w-10 px-4 py-2">
                <input
                  type="checkbox"
                  aria-label="Elegir todos"
                  className="size-4 accent-[var(--color-ember-2)]"
                  checked={selection.allSelected}
                  ref={input => {
                    if (input) input.indeterminate = selection.someSelected
                  }}
                  onChange={selection.toggleAll}
                />
              </th>
              <th className="px-2 py-2 font-medium">Asegurado</th>
              <th className="px-2 py-2 font-medium">Póliza · cuota</th>
              <th className="px-2 py-2 font-medium">Vencimiento</th>
              <th className="px-2 py-2 text-right font-medium">Importe</th>
              <th className="px-2 py-2 font-medium">Medio · motivo</th>
              <th className="px-2 py-2 font-medium">WhatsApp</th>
              <th className="px-2 py-2 font-medium">Estado</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.rows.map(row => {
              const status = statusLabel(row)
              return (
                <tr key={row.id} className={cn('align-top', !isOpen(row) && 'text-ink-3')}>
                  <td className="px-4 py-2.5">
                    {isOpen(row) && (
                      <input
                        type="checkbox"
                        aria-label={`Elegir ${row.holderName}`}
                        className="size-4 accent-[var(--color-ember-2)]"
                        checked={selection.isSelected(row.id)}
                        onChange={() => selection.toggle(row.id)}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <p className="min-w-[160px] font-medium text-ink">{row.holderName}</p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {row.client ? 'En la cartera' : 'No está en la cartera'} · fila {row.rowNumber}
                    </p>
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap tabular-nums">
                    {row.certificateNumber} · {row.installmentNumber}
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap tabular-nums">{formatDay(row.dueDate)}</td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap tabular-nums">{formatMoney(row.amount)}</td>
                  <td className="px-2 py-2.5">
                    <p>{paymentMeans(row)}</p>
                    <p className="text-[11.5px] text-muted-foreground">{row.reason}</p>
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap tabular-nums">
                    {row.waId ? formatWaId(row.waId) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap',
                        status.tone,
                      )}
                    >
                      {status.text}
                    </span>
                    {row.error && <p className="mt-1 max-w-[220px] text-[11.5px] text-destructive">{row.error}</p>}
                    {row.sentAt && (row.status === 'SENT' || row.status === 'MARKED') && (
                      <p className="mt-1 text-[11.5px] text-muted-foreground">
                        {formatMoment(row.sentAt)}
                        {row.sentBy ? ` · ${personName(row.sentBy)}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    {row.conversationId ? (
                      <Link
                        href={`/admin/inbox?conversation=${row.conversationId}`}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-ink"
                        title="Ver el chat"
                        aria-label={`Ver el chat de ${row.holderName}`}
                      >
                        <MessageSquare className="size-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPreview(row)}
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-ink"
                        title="Ver el mensaje"
                        aria-label={`Ver el mensaje para ${row.holderName}`}
                      >
                        <Eye className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={preview !== null} onOpenChange={open => !open && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensaje para {preview?.holderName}</DialogTitle>
            <DialogDescription>
              Lo que le llega por WhatsApp{preview?.waId ? ` al ${formatWaId(preview.waId)}` : ''}.
            </DialogDescription>
          </DialogHeader>
          <MessageBubble text={preview?.message ?? ''} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm !== null} onOpenChange={open => !open && !busy && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'send'
                ? `¿Enviar el aviso a ${selection.toSend.length} cliente${selection.toSend.length === 1 ? '' : 's'}?`
                : confirm === 'mark'
                  ? `¿Marcar ${selection.toMark.length} como avisados a mano?`
                  : '¿Eliminar esta carga?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'send'
                ? 'El bot les escribe por WhatsApp de a uno. Si contestan, el bot sigue la charla sabiendo que es por este rechazo y el chat aparece en Whatsapp. Por ejemplo:'
                : confirm === 'mark'
                  ? 'No se les manda nada. Quedan como avisados y no se vuelven a ofrecer, tampoco si el mismo rechazo viene en otro Excel.'
                  : 'Se borra la lista de este Excel. Los avisos que ya salieron siguen en los chats.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirm === 'send' && example && <MessageBubble text={example.message} />}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button variant={confirm === 'delete' ? 'destructive' : 'default'} onClick={runConfirmed} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {confirm === 'send' ? 'Sí, enviar' : confirm === 'mark' ? 'Sí, marcar' : 'Sí, eliminar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Chip({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        strong && value > 0 ? 'border-amber-border bg-ember-soft text-ember-2' : 'border-line-2 text-ink-3',
      )}
    >
      {label}
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}

function MessageBubble({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-3">
      <p className="max-w-[420px] rounded-lg rounded-tl-none bg-card p-3 text-[13.5px] leading-relaxed text-ink shadow-sm">
        {text}
      </p>
    </div>
  )
}
