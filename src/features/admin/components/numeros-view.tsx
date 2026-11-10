'use client'

import { useState, type FormEvent } from 'react'
import { AlertTriangle, Bot, Loader2, Phone, Plus, PowerOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { BranchNameField } from './branch-name-field'
import { ConectarWhatsapp } from './conectar-whatsapp'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
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
import type { AdminPhoneNumber } from '@/src/types/api/phone-numbers'
import { useRole } from '../hooks/use-role'
import { useProducerCodes } from '../hooks/use-producer-codes'
import { useOwnProducerCodes } from '../hooks/use-own-producer-codes'
import { usePhoneNumbers, usePhoneNumberMutations } from '../hooks/use-phone-numbers'
import { useNumberAssistant } from '../hooks/use-number-assistant'
import { numberLabel } from '../lib/number-label'
import { NumberAssistantSheet } from './number-assistant-sheet'
import { MetaPortfolioLine } from './meta-portfolio-line'
import { numberSetupFrom } from './number-setup-fields'
import { useLinkedId } from '../hooks/use-panel-link'

const int = (n: number) => n.toLocaleString('es-AR')

const formatMoment = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Cordoba',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

/** What happened to each dropped number and what to do, above the reconnect button. */
function DisconnectedNotice({ numbers }: { numbers: AdminPhoneNumber[] }) {
  return (
    <div className="mb-3 flex gap-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div>
        <h2 className="font-display text-[15px] text-ink">WhatsApp desconectado</h2>
        <ul className="mt-1 flex flex-col gap-1 text-[13px] text-ink-3">
          {numbers.map(n => (
            <li key={n.id}>
              <span className="font-medium text-ink">{numberLabel(n)}</span> se desconectó el{' '}
              {formatMoment(n.disconnectedAt as string)}. Motivo: {n.disconnectReasonLabel ?? n.disconnectReason}.
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Mientras tanto el bot no recibe ni responde mensajes y lo que se envíe desde el panel no llega. Con el celular
          de WhatsApp Business a mano, tocá <span className="font-medium text-ink">Reconectar número</span> y seguí los
          pasos de Meta. No hace falta darlo de baja: se conservan el consumo del mes, los chats y los códigos. No uses
          “Conectar” ni “Añadir número” en el Administrador de WhatsApp de Meta: saca el número de la app del celular.
        </p>
      </div>
    </div>
  )
}

/**
 * Meta's signup with the branch and the assistant asked first. Reconnecting the
 * only number Meta dropped, the form comes filled with what that number answers
 * with today, so the office does not retype it and nothing it had is lost.
 */
function ConnectNumber({
  dropped,
  responsibleProducerCodeId,
}: {
  dropped: AdminPhoneNumber[]
  responsibleProducerCodeId?: number
}) {
  const only = dropped.length === 1 ? dropped[0] : null
  const { data } = useNumberAssistant(only?.id ?? null)
  const initial =
    only && data?.id === only.id ? { branchName: data.branchName ?? '', setup: numberSetupFrom(data) } : undefined
  return (
    <ConectarWhatsapp
      // Remounted once the number's data arrives, so the form starts filled.
      key={initial ? `reconnect-${only?.id}` : 'connect'}
      initial={initial}
      responsibleProducerCodeId={responsibleProducerCodeId}
      label={dropped.length > 0 ? 'Reconectar número' : undefined}
    />
  )
}

/**
 * An admin connects numbers for their own codes: the API bills the number to the
 * code they pick here (their only one when they have a single code).
 */
function AdminConnect({ dropped }: { dropped: AdminPhoneNumber[] }) {
  const codes = useOwnProducerCodes()
  const [picked, setPicked] = useState<number | undefined>()
  const responsible = picked ?? codes[0]?.id

  if (codes.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Tu usuario no tiene códigos de productor asignados. Pedile al SuperAdmin que te asigne uno para conectar
        números.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {codes.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="connect-code">Código responsable</Label>
          <select
            id="connect-code"
            value={responsible}
            onChange={e => setPicked(Number(e.target.value))}
            className="h-10 w-fit rounded-md border border-line-2 bg-background px-3 text-[13px]"
          >
            {codes.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}
                {c.holderName ? ` · ${c.holderName}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          El número queda a cargo de tu código <span className="font-medium text-ink">{codes[0].code}</span>.
        </p>
      )}
      <ConnectNumber dropped={dropped} responsibleProducerCodeId={responsible} />
    </div>
  )
}

function NumberForm({ existing, onDone }: { existing: AdminPhoneNumber | null; onDone: () => void }) {
  const isEdit = !!existing
  const { data: codes } = useProducerCodes()
  const { create, update } = usePhoneNumberMutations()

  const [phoneNumberId, setPhoneNumberId] = useState(existing?.phoneNumberId ?? '')
  const [number, setNumber] = useState(existing?.number ?? '')
  const [branchName, setBranchName] = useState(existing?.branchName ?? '')
  const [responsible, setResponsible] = useState<number | undefined>(existing?.responsibleCode?.id)
  const [served, setServed] = useState<number[]>(existing?.servedCodes.map(c => c.id) ?? [])

  const pending = create.isPending || update.isPending
  const toggleServed = (id: number) =>
    setServed(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body = {
      branchName: branchName.trim(),
      responsibleProducerCodeId: responsible,
      servedCodeIds: served,
    }
    if (isEdit) {
      update.mutate(
        { id: existing.id, data: { number, ...body } },
        {
          onSuccess: () => {
            toast.success('Número actualizado')
            onDone()
          },
          onError: () => toast.error('No se pudo guardar.'),
        },
      )
    } else {
      create.mutate(
        { phoneNumberId, number, ...body },
        {
          onSuccess: () => {
            toast.success('Número registrado')
            onDone()
          },
          onError: () => toast.error('No se pudo registrar (¿id de Meta repetido?).'),
        },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="meta-id">Meta phone_number_id</Label>
        <Input
          id="meta-id"
          required
          disabled={isEdit}
          placeholder="p.ej. 552431122334455"
          value={phoneNumberId}
          onChange={e => setPhoneNumberId(e.target.value)}
        />
        <p className="text-[12px] text-muted-foreground">El id que Meta envía en el webhook (no el número visible).</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="display">Número visible</Label>
        <Input
          id="display"
          required
          placeholder="+54 9 11 5555-5555"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />
      </div>

      <BranchNameField id="number-form-branch" required number={number} value={branchName} onChange={setBranchName} />

      <div className="flex flex-col gap-2">
        <Label>Código responsable (facturación)</Label>
        <select
          value={responsible ?? ''}
          onChange={e => setResponsible(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 rounded-md border border-line-2 bg-background px-3 text-[13px]"
        >
          <option value="">— Sin asignar —</option>
          {(codes ?? []).map(c => (
            <option key={c.id} value={c.id}>
              {c.code}
              {c.holderName ? ` · ${c.holderName}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Códigos que también atiende</Label>
        <div className="max-h-40 overflow-y-auto rounded-md border border-line-2 p-2">
          {(codes ?? []).map(c => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 hover:bg-secondary"
            >
              <input
                type="checkbox"
                className="size-4 accent-ember-2"
                checked={served.includes(c.id)}
                onChange={() => toggleServed(c.id)}
              />
              <span className="text-[13px] text-ink">
                <span className="font-medium">{c.code}</span>
                {c.holderName ? <span className="text-muted-foreground"> · {c.holderName}</span> : null}
              </span>
            </label>
          ))}
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
            'Guardar'
          ) : (
            'Registrar'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function NumerosView() {
  const { isSuperAdmin, isAdmin, isLoading: roleLoading } = useRole()
  const canView = isSuperAdmin || isAdmin
  const currentMonth = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Cordoba' }).slice(0, 7)
  const [period, setPeriod] = useState(currentMonth)
  const { data: numbers, isLoading, isError } = usePhoneNumbers(canView, period)
  const { remove } = usePhoneNumberMutations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPhoneNumber | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPhoneNumber | null>(null)
  const [assistantId, setAssistantId] = useState<number | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  // ?numero=ID (the assistant's links) opens that number's assistant.
  const clearLinkedNumber = useLinkedId('numero', id => {
    setAssistantId(id)
    setAssistantOpen(true)
  })

  if (!roleLoading && !canView) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-16 text-center md:px-8">
        <h1 className="font-display text-[22px] text-ink">Acceso restringido</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">Tu usuario no tiene acceso a los números.</p>
      </div>
    )
  }

  // Each number's messages of the month; plans and amounts are in Facturación.
  const totalMessages = (numbers ?? []).reduce((sum, n) => sum + n.usage.messages, 0)
  const disconnected = (numbers ?? []).filter(n => n.disconnectedAt)
  const columns = isSuperAdmin ? 5 : 4

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Plataforma</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            Números y consumo
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            {isSuperAdmin
              ? 'Números de WhatsApp, código responsable y consumo del mes: mensajes y uso de la IA.'
              : 'Los números de WhatsApp a tu cargo y los mensajes que enviaron en el mes.'}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
            className="h-10"
          >
            <Plus className="size-4" /> Registrar número
          </Button>
        )}
      </div>

      {/* Embedded Signup leaves the number connected and subscribed to the
          webhooks with nothing typed by hand. "Registrar número" (SuperAdmin) is
          for numbers that already exist in Meta. An admin connects numbers for
          their own codes. */}
      {canView && (
        <Card
          className={`mb-4 p-4 ${disconnected.length > 0 ? 'border-destructive/40 bg-destructive/5' : 'border-line-2'}`}
        >
          {disconnected.length > 0 ? (
            <DisconnectedNotice numbers={disconnected} />
          ) : (
            <div className="mb-3">
              <h2 className="font-display text-[15px] text-ink">Conectar un número desde Meta</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Abre el alta de Meta y deja el número listo para recibir mensajes. El número sigue funcionando en la app
                de WhatsApp Business del celular.
              </p>
            </div>
          )}
          {isSuperAdmin ? <ConnectNumber dropped={disconnected} /> : <AdminConnect dropped={disconnected} />}
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="billing-period">Mes de consumo</Label>
          <Input
            id="billing-period"
            type="month"
            value={period}
            max={currentMonth}
            onChange={event => {
              if (event.target.value) setPeriod(event.target.value)
            }}
            className="mt-1 w-48"
          />
        </div>
        <p className="text-[13px] text-muted-foreground">
          Cuenta cada mensaje que envía el asistente, la oficina desde el panel o un aviso. Los planes están en
          Facturación.
        </p>
      </div>
      {isError && (
        <p role="alert" className="mb-4 text-destructive">
          No se pudo cargar el consumo de este mes.
        </p>
      )}
      {period < '2026-10' && (
        <p className="mb-4 text-[13px] text-muted-foreground">
          El conteo de mensajes y llamadas comienza con la actualización de octubre. Los meses anteriores conservan el
          consumo registrado.
        </p>
      )}
      <Card className="mb-4 flex items-center justify-between border-line-2 p-4">
        <span className="text-[13px] text-muted-foreground">
          Mensajes del mes · {period} ({isSuperAdmin ? 'todos los números' : 'tus números'})
        </span>
        <span className="font-display text-[20px] text-ink">{numbers && !isError ? int(totalMessages) : '—'}</span>
      </Card>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Número
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Responsable
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Mensajes del mes
              </TableHead>
              {isSuperAdmin && (
                <TableHead className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Uso de IA
                </TableHead>
              )}
              <TableHead className="w-24 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: columns }).map((_, j) => (
                    <TableCell key={j} className={j === 0 ? 'pl-5' : undefined}>
                      <Skeleton className={j === 0 ? 'h-4 w-40' : 'h-4 w-20'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {numbers && numbers.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Phone className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">
                      {isSuperAdmin ? 'Todavía no hay números registrados.' : 'Todavía no tenés números a tu cargo.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {numbers?.map(n => (
              <TableRow key={n.id}>
                <TableCell className="pl-5">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-ink">{numberLabel(n)}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{n.phoneNumberId}</span>
                    <MetaPortfolioLine portfolio={n.portfolio} />
                    <div className="mt-1 flex flex-wrap gap-1">
                      {n.disconnectedAt && (
                        <Badge variant="destructive" title={n.disconnectReasonLabel ?? undefined}>
                          Desconectado de WhatsApp
                        </Badge>
                      )}
                      {!n.isActive && (
                        <Badge variant="secondary" className="text-faint-2">
                          Inactivo
                        </Badge>
                      )}
                      {n.budgetExceededAt && (
                        <Badge
                          className="bg-destructive/15 text-destructive"
                          title="Se alcanzó el límite de IA del mes: el asistente sigue atendiendo con los menús."
                        >
                          IA en pausa
                        </Badge>
                      )}
                      {n.servedCodes.length > 0 && (
                        <Badge variant="secondary" className="text-ink-3">
                          {n.servedCodes.length} código(s) servidos
                        </Badge>
                      )}
                      {n.assistant?.customized && (
                        <Badge
                          className="gap-1 bg-ember-soft text-ember-2"
                          title="Este número tiene su propio asistente"
                        >
                          <Bot className="size-3" />
                          {n.assistant.botName ?? 'Asistente propio'}
                        </Badge>
                      )}
                      {n.usage.planPaused && (
                        <Badge
                          className="gap-1 bg-amber/15 text-ink-3"
                          title="Llegó al límite de su plan este mes: se elige en Inicio o en Facturación si sigue en el plan siguiente"
                        >
                          <PowerOff className="size-3" />
                          En pausa por el plan
                        </Badge>
                      )}
                      {n.botEnabled === false && (
                        <Badge
                          className="gap-1 bg-destructive/10 text-destructive"
                          title="El bot está apagado en este número: la oficina responde sus chats"
                        >
                          <PowerOff className="size-3" />
                          Bot apagado
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-ink-3">
                  {n.responsibleCode
                    ? `${n.responsibleCode.code}${n.responsibleCode.holderName ? ` · ${n.responsibleCode.holderName}` : ''}`
                    : '—'}
                </TableCell>
                <TableCell className="text-[13px]">
                  <span className="font-medium text-ink">{int(n.usage.messages)}</span>
                  <div className="text-[11px] text-muted-foreground">
                    {n.usage.plan ? `plan ${n.usage.plan.trial ? 'Prueba' : n.usage.plan.name}` : 'mensajes enviados'}
                    {n.usage.upgraded && ' · subió de plan'}
                  </div>
                </TableCell>
                {isSuperAdmin && (
                  <TableCell className="text-[13px]">
                    <span className="text-ink">{int(n.usage.openaiCalls ?? 0)} consultas a la IA</span>
                    <div className="text-[11px] text-muted-foreground">respuestas que no resolvieron los menús</div>
                  </TableCell>
                )}
                <TableCell className="pr-5">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      title={
                        n.canConfigureAssistant
                          ? 'Nombre, personas, horario y datos propios de este número'
                          : 'Ver el asistente de este número'
                      }
                      data-help="numero-asistente"
                      onClick={() => {
                        setAssistantId(n.id)
                        setAssistantOpen(true)
                      }}
                    >
                      <Bot className="size-4" /> Asistente
                    </Button>
                    {isSuperAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            setEditing(n)
                            setDialogOpen(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground"
                          onClick={() => setDeleteTarget(n)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[20px]">
              {editing ? 'Editar número' : 'Registrar número'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualizá el número visible, el código responsable o los códigos servidos.'
                : 'Registrá un número de Meta para que el bot lo atienda.'}
            </DialogDescription>
          </DialogHeader>
          {dialogOpen && (
            <NumberForm key={editing?.id ?? 'new'} existing={editing} onDone={() => setDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <NumberAssistantSheet
        numberId={assistantId}
        open={assistantOpen}
        onOpenChange={open => {
          setAssistantOpen(open)
          if (!open) clearLinkedNumber()
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Dar de baja el número?</AlertDialogTitle>
            <AlertDialogDescription>
              El bot dejará de atender{' '}
              <span className="font-medium text-ink">{deleteTarget && numberLabel(deleteTarget)}</span> y su consumo del
              mes deja de verse acá. Si Meta lo desconectó, no lo des de baja: usá Reconectar número.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault()
                if (!deleteTarget) return
                remove.mutate(deleteTarget.id, {
                  onSuccess: () => {
                    toast.success('Número dado de baja')
                    setDeleteTarget(null)
                  },
                  onError: () => toast.error('No se pudo dar de baja.'),
                })
              }}
              disabled={remove.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {remove.isPending ? 'Procesando…' : 'Dar de baja'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
