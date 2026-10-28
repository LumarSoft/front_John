'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  RotateCcw,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { ApiError } from '@/src/lib/api-client'
import type { CobranzasScopeQuery } from '@/src/types/api/cobranzas'
import type {
  ExpiredPolicy,
  ExpiredPolicySort,
  ExpiryNoticeSkipReason,
  SendExpiryNoticesResponse,
} from '@/src/types/api/expired-policies'
import { useExpiredPolicies, useExpiredPolicyActions } from '../hooks/use-expired-policies'
import { useProfile } from '../hooks/use-profile'
import { formatDate, initials, policyName, RISK_LABELS, RiskIcon } from '../lib/asegurados-ui'

const PAGE_SIZE = 25

/** The reasons the office gives most; any other goes in the text. */
const HIDE_REASONS = ['Vendió el vehículo', 'Se aseguró en otra compañía', 'No quiere renovar']

const SORTS: { value: ExpiredPolicySort; label: string }[] = [
  { value: 'oldest', label: 'Más tiempo vencidas' },
  { value: 'recent', label: 'Vencidas hace poco' },
]

const SKIP_LABELS: Record<ExpiryNoticeSkipReason, string> = {
  NO_PHONE: 'sin teléfono',
  ALREADY_NOTIFIED: 'ya avisadas este mes',
  SENDING: 'en envío',
}

function expiredLabel(days: number): string {
  if (days <= 0) return 'venció hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 60) return `hace ${days} días`
  const months = Math.round(days / 30)
  return `hace ${months} meses`
}

/** What the policy covered, as the client knows it. */
function itemOf(policy: ExpiredPolicy): string {
  return policy.licensePlate ?? policyName({ riskType: policy.riskType, product: policy.product })
}

/** The notice as the client will read it (the same text as the Meta template). */
function noticeText(policy: ExpiredPolicy, orgName: string): string {
  const name = policy.client.firstName.split(/\s+/)[0] || policy.client.firstName
  return (
    `Hola ${name}, te escribimos de ${orgName}, tu productor de seguros. ` +
    `Tu póliza ${policy.certificateNumber} (${itemOf(policy)}) venció el ${formatDate(policy.validTo)}. ` +
    `Si querés renovarla o cotizar otra opción, respondé este mensaje y te ayudamos.`
  )
}

/** Pre-filled WhatsApp link with the same text, for the office's own phone. */
function renewalWhatsappUrl(policy: ExpiredPolicy, orgName: string): string {
  const digits = (policy.client.phone ?? '').replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(noticeText(policy, orgName))}`
}

/** What a send came back with, in one line for the office. */
function summarizeSend(result: SendExpiryNoticesResponse): string {
  const sent = result.sent === 1 ? '1 aviso en camino' : `${result.sent} avisos en camino`
  if (!result.skipped.length) return sent
  const reasons = new Map<ExpiryNoticeSkipReason, number>()
  for (const s of result.skipped) reasons.set(s.reason, (reasons.get(s.reason) ?? 0) + 1)
  const skipped = [...reasons].map(([reason, n]) => `${n} ${SKIP_LABELS[reason]}`).join(', ')
  return `${sent}; sin enviar: ${skipped}`
}

// ─── Notice status ───────────────────────────────────────────────────────────────

function NoticeCell({ policy }: { policy: ExpiredPolicy }) {
  const notice = policy.notice
  if (!notice) return <span className="text-[12px] text-muted-foreground">—</span>
  const when = formatDate(notice.sentAt ?? notice.createdAt)
  switch (notice.status) {
    case 'SENDING':
      return (
        <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Enviando…
        </span>
      )
    case 'SENT':
      return (
        <div className="text-[12px] text-emerald-600 dark:text-emerald-400">
          <span className="inline-flex items-center gap-1">
            <WhatsAppIcon className="size-3.5" />
            Avisado
          </span>
          <div className="text-[11px] text-muted-foreground">{when}</div>
        </div>
      )
    case 'MARKED':
      return (
        <div className="text-[12px] text-emerald-600 dark:text-emerald-400">
          <span className="inline-flex items-center gap-1">
            <CheckCheck className="size-3.5" />
            Avisado a mano
          </span>
          <div className="text-[11px] text-muted-foreground">{when}</div>
        </div>
      )
    case 'FAILED':
      return (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-default items-center gap-1 text-[12px] text-destructive">
                <AlertCircle className="size-3.5" />
                No se envió
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{notice.error ?? 'No se pudo enviar el aviso.'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
  }
}

// ─── Row ────────────────────────────────────────────────────────────────────────

function ExpiredPolicyRow({
  policy,
  orgName,
  showingHidden,
  selected,
  onToggle,
  onSelect,
  onHide,
  onUnhide,
  busy,
}: {
  policy: ExpiredPolicy
  orgName: string
  showingHidden: boolean
  selected: boolean
  onToggle: () => void
  onSelect: () => void
  onHide: () => void
  onUnhide: () => void
  busy: boolean
}) {
  const fullName = `${policy.client.lastName}, ${policy.client.firstName}`
  const label = policyName({ riskType: policy.riskType, product: policy.product })
  const canTick = !showingHidden && policy.notice?.status !== 'SENDING'
  return (
    <TableRow
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${fullName}`}
      className={`group cursor-pointer hover:bg-ember-soft/40 focus-visible:bg-ember-soft/40 focus-visible:outline-none ${
        selected ? 'bg-ember-soft/30' : ''
      }`}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {!showingHidden && (
        <TableCell className="w-10 pl-4 pr-0" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            disabled={!canTick}
            onChange={onToggle}
            aria-label={`Elegir la póliza ${policy.certificateNumber}`}
            className="size-4 accent-ember"
          />
        </TableCell>
      )}

      <TableCell className="py-3 pl-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-ember-soft text-[12px] font-semibold text-ember-2">
              {initials(policy.client.firstName, policy.client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-ink">{fullName}</div>
            <div className="text-[12px] text-muted-foreground">
              DNI {policy.client.dni}
              {!policy.client.phone && <span className="text-amber-700 dark:text-amber"> · sin teléfono</span>}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2.5">
          <span
            title={RISK_LABELS[policy.riskType]}
            className="flex size-6 shrink-0 items-center justify-center rounded-md border border-line-2 bg-secondary/60 text-ink-3"
          >
            <RiskIcon type={policy.riskType} className="size-3.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] text-ink">
              {policy.licensePlate ? (
                <span className="font-mono font-medium tracking-wider">{policy.licensePlate}</span>
              ) : (
                label
              )}
              {policy.vehicle && <span className="text-muted-foreground"> · {policy.vehicle}</span>}
            </div>
            <div className="text-[11.5px] text-muted-foreground">
              Póliza {policy.certificateNumber}
              {policy.producerCode ? ` · ${policy.producerCode.code}` : ''}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-[13px] font-medium text-destructive">{expiredLabel(policy.daysExpired)}</div>
        <div className="text-[11.5px] text-muted-foreground">{formatDate(policy.validTo)}</div>
      </TableCell>

      <TableCell className="hidden lg:table-cell">
        <div className="text-[12.5px] text-ink-3">{policy.paymentMethod ?? '—'}</div>
        {policy.unpaidInstallments > 0 && (
          <div className="text-[11px] text-amber-700 dark:text-amber">
            {policy.unpaidInstallments} {policy.unpaidInstallments === 1 ? 'cuota sin pagar' : 'cuotas sin pagar'}
          </div>
        )}
        {showingHidden && policy.hiddenReason && (
          <div className="text-[11px] text-muted-foreground">Oculta: {policy.hiddenReason}</div>
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <NoticeCell policy={policy} />
      </TableCell>

      <TableCell className="pr-4 text-right">
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
            {policy.client.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                  >
                    <a href={renewalWhatsappUrl(policy, orgName)} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-4" />
                      <span className="sr-only">Escribir desde tu WhatsApp</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Escribir desde tu WhatsApp</TooltipContent>
              </Tooltip>
            )}
            {policy.client.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                  >
                    <a href={`tel:${policy.client.phone}`}>
                      <Phone className="size-4" />
                      <span className="sr-only">Llamar</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Llamar</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy}
                  onClick={showingHidden ? onUnhide : onHide}
                  className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : showingHidden ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <EyeOff className="size-4" />
                  )}
                  <span className="sr-only">{showingHidden ? 'Volver a mostrar' : 'Ocultar: no se renueva'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showingHidden ? 'Volver a mostrar' : 'Ocultar: no se renueva'}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  )
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────────

function HideDialog({
  policy,
  pending,
  onConfirm,
  onClose,
}: {
  policy: ExpiredPolicy | null
  pending: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const close = () => {
    setReason('')
    onClose()
  }
  return (
    <Dialog open={policy !== null} onOpenChange={open => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ocultar póliza vencida</DialogTitle>
          <DialogDescription>
            {policy
              ? `La póliza ${policy.certificateNumber} de ${policy.client.firstName} ${policy.client.lastName} sale de la lista. Podés volver a verla en "Ocultas".`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {HIDE_REASONS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                  reason === preset
                    ? 'border-ember bg-ember-soft text-ember-2'
                    : 'border-line-2 text-ink-3 hover:bg-secondary'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Input
            placeholder="Motivo (opcional)"
            value={reason}
            maxLength={120}
            onChange={e => setReason(e.target.value)}
            className="h-10 border-line-2 text-[13px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close} className="border-line-2">
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={() => onConfirm(reason)}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Ocultar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** "Enviar aviso": how many go out, and the message as the first client will read it. */
function SendDialog({
  policies,
  orgName,
  pending,
  onConfirm,
  onClose,
}: {
  policies: ExpiredPolicy[]
  orgName: string
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const sample = policies[0]
  return (
    <Dialog open={policies.length > 0} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {policies.length === 1 ? 'Enviar 1 aviso por WhatsApp' : `Enviar ${policies.length} avisos por WhatsApp`}
          </DialogTitle>
          <DialogDescription>
            Cada cliente recibe este mensaje con sus datos, desde el número por el que ya habla con la oficina. Lo que
            responda llega a la bandeja de Whatsapp.
          </DialogDescription>
        </DialogHeader>
        {sample && (
          <div className="rounded-lg border border-line-2 bg-secondary/40 p-3 text-[13px] leading-relaxed text-ink-3">
            {noticeText(sample, orgName)}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={onConfirm}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────────

export function ExpiredPoliciesTab({
  scope,
  search,
  onSelectClient,
}: {
  scope: CobranzasScopeQuery
  search: string
  onSelectClient: (clientId: number) => void
}) {
  const [showHidden, setShowHidden] = useState(false)
  const [sort, setSort] = useState<ExpiredPolicySort>('oldest')
  const [page, setPage] = useState(1)
  const [toHide, setToHide] = useState<ExpiredPolicy | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmSend, setConfirmSend] = useState(false)
  const { data: profile } = useProfile()
  const orgName = profile?.organization?.displayName ?? profile?.organization?.name ?? 'tu productor de seguros'

  const { data, isLoading, isError, isFetching } = useExpiredPolicies({
    ...scope,
    search,
    hidden: showHidden,
    sort,
    page,
    pageSize: PAGE_SIZE,
  })
  const { hide, unhide, send, mark } = useExpiredPolicyActions()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const hiddenCount = data?.hiddenCount ?? 0
  const templateReady = data?.templateReady ?? false
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  // Only what is on screen can be acted on: a row that left the page is dropped.
  const selectable = rows.filter(row => row.notice?.status !== 'SENDING')
  const selected = selectable.filter(row => selectedIds.has(row.id))
  const allSelected = selectable.length > 0 && selected.length === selectable.length

  const resetAnd = (change: () => void) => {
    change()
    setSelectedIds(new Set())
    setPage(1)
  }
  const toggleHidden = () => resetAnd(() => setShowHidden(v => !v))
  const changeSort = (value: ExpiredPolicySort) => resetAnd(() => setSort(value))
  const changePage = (next: number) => {
    setPage(next)
    setSelectedIds(new Set())
  }
  const toggle = (id: number) =>
    setSelectedIds(current => {
      const ids = new Set(current)
      if (ids.has(id)) ids.delete(id)
      else ids.add(id)
      return ids
    })
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectable.map(row => row.id)))

  const confirmHide = (reason: string) => {
    if (!toHide) return
    setBusyId(toHide.id)
    hide.mutate(
      { id: toHide.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Póliza oculta de la lista')
          setToHide(null)
        },
        onError: () => toast.error('No se pudo ocultar la póliza'),
        onSettled: () => setBusyId(null),
      },
    )
  }
  const restore = (policy: ExpiredPolicy) => {
    setBusyId(policy.id)
    unhide.mutate(policy.id, {
      onSuccess: () => toast.success('La póliza vuelve a la lista'),
      onError: () => toast.error('No se pudo volver a mostrar la póliza'),
      onSettled: () => setBusyId(null),
    })
  }
  const failed = (error: unknown, fallback: string) =>
    toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)
  const sendSelected = () =>
    send.mutate(
      selected.map(row => row.id),
      {
        onSuccess: result => {
          toast.success(summarizeSend(result))
          setConfirmSend(false)
          setSelectedIds(new Set())
        },
        onError: error => failed(error, 'No se pudieron enviar los avisos'),
      },
    )
  const markSelected = () =>
    mark.mutate(
      selected.map(row => row.id),
      {
        onSuccess: result => {
          toast.success(
            result.marked === 1 ? '1 póliza marcada como avisada' : `${result.marked} pólizas marcadas como avisadas`,
          )
          setSelectedIds(new Set())
        },
        onError: error => failed(error, 'No se pudieron marcar las pólizas'),
      },
    )

  const columns = showingHiddenColumns(showHidden)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Pólizas que vencieron en el último año y no se renovaron, sin las anuladas por Triunfo ni las que ya tienen
          otra póliza vigente.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {!showHidden && (
            <>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={selected.length === 0 || !templateReady || send.isPending}
                        onClick={() => setConfirmSend(true)}
                        className="h-9 text-[12.5px]"
                      >
                        <Send className="size-4" />
                        Enviar aviso{selected.length > 0 ? ` (${selected.length})` : ''}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!templateReady && (
                    <TooltipContent>La plantilla de WhatsApp todavía está en revisión de Meta.</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={selected.length === 0 || mark.isPending}
                onClick={markSelected}
                className="h-9 border-line-2 text-[12.5px]"
              >
                {mark.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                Avisados a mano{selected.length > 0 ? ` (${selected.length})` : ''}
              </Button>
            </>
          )}
          <select
            value={sort}
            onChange={e => changeSort(e.target.value as ExpiredPolicySort)}
            className="h-9 rounded-md border border-line-2 bg-background px-2.5 text-[12.5px] text-ink-3"
            aria-label="Ordenar"
          >
            {SORTS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant={showHidden ? 'default' : 'outline'}
            onClick={toggleHidden}
            className={showHidden ? 'h-9 text-[12.5px]' : 'h-9 border-line-2 text-[12.5px]'}
          >
            {showHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {showHidden ? 'Volver a la lista' : `Ocultas (${hiddenCount})`}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              {!showHidden && (
                <TableHead className="h-11 w-10 pl-4 pr-0">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    disabled={selectable.length === 0}
                    onChange={toggleAll}
                    aria-label="Elegir todas las pólizas de la página"
                    className="size-4 accent-ember"
                  />
                </TableHead>
              )}
              <TableHead className="h-11 pl-3 text-[11px] uppercase tracking-[0.12em] text-faint">Asegurado</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Póliza</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Venció</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint lg:table-cell">
                Medio de pago
              </TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint md:table-cell">
                Aviso
              </TableHead>
              <TableHead className="pr-5 text-right text-[11px] uppercase tracking-[0.12em] text-faint">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {!showHidden && <TableCell className="pl-4 pr-0" />}
                  <TableCell className="py-3 pl-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-36 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-24 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={columns} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar las pólizas vencidas.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} className="py-16 text-center text-[14px] text-muted-foreground">
                  {showHidden
                    ? 'No hay pólizas ocultas.'
                    : search
                      ? 'No se encontraron pólizas vencidas para esa búsqueda.'
                      : 'No hay pólizas vencidas sin renovar. Tu cartera está al día.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(policy => (
                <ExpiredPolicyRow
                  key={policy.id}
                  policy={policy}
                  orgName={orgName}
                  showingHidden={showHidden}
                  selected={selectedIds.has(policy.id)}
                  busy={busyId === policy.id}
                  onToggle={() => toggle(policy.id)}
                  onSelect={() => onSelectClient(policy.client.id)}
                  onHide={() => setToHide(policy)}
                  onUnhide={() => restore(policy)}
                />
              ))}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && !isError && total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-muted-foreground">
            Mostrando{' '}
            <span className="font-medium text-ink-3">
              {rangeStart}–{rangeEnd}
            </span>{' '}
            de <span className="font-medium text-ink-3">{total}</span> {total === 1 ? 'póliza' : 'pólizas'}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => changePage(Math.max(1, page - 1))}
                className="h-8 border-line-2 px-2.5 text-[12.5px]"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <span className="text-[12.5px] text-muted-foreground">
                Página <span className="font-medium text-ink-3">{page}</span> de {totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                className="h-8 border-line-2 px-2.5 text-[12.5px]"
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <HideDialog policy={toHide} pending={hide.isPending} onConfirm={confirmHide} onClose={() => setToHide(null)} />
      <SendDialog
        policies={confirmSend ? selected : []}
        orgName={orgName}
        pending={send.isPending}
        onConfirm={sendSelected}
        onClose={() => setConfirmSend(false)}
      />
    </>
  )
}

/** How many columns a full-width cell spans: the checkbox column is only there for the visible list. */
function showingHiddenColumns(showHidden: boolean): number {
  return showHidden ? 6 : 7
}
