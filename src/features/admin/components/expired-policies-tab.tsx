'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Phone, RotateCcw } from 'lucide-react'
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
import type { CobranzasScopeQuery } from '@/src/types/api/cobranzas'
import type { ExpiredPolicy, ExpiredPolicySort } from '@/src/types/api/expired-policies'
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

function expiredLabel(days: number): string {
  if (days <= 0) return 'venció hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 60) return `hace ${days} días`
  const months = Math.round(days / 30)
  return `hace ${months} meses`
}

/** Pre-filled WhatsApp link offering to renew the policy. */
function renewalWhatsappUrl(policy: ExpiredPolicy, orgName: string): string {
  const digits = (policy.client.phone ?? '').replace(/\D/g, '')
  const item = policy.licensePlate ? ` (${policy.licensePlate})` : ''
  const message =
    `Hola ${policy.client.firstName}, te escribimos de ${orgName}. ` +
    `Tu póliza ${policy.certificateNumber}${item} venció el ${formatDate(policy.validTo)}. ` +
    `¿Querés que te pasemos una propuesta para renovarla?`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

// ─── Row ────────────────────────────────────────────────────────────────────────

function ExpiredPolicyRow({
  policy,
  orgName,
  showingHidden,
  onSelect,
  onHide,
  onUnhide,
  busy,
}: {
  policy: ExpiredPolicy
  orgName: string
  showingHidden: boolean
  onSelect: () => void
  onHide: () => void
  onUnhide: () => void
  busy: boolean
}) {
  const fullName = `${policy.client.lastName}, ${policy.client.firstName}`
  const label = policyName({ riskType: policy.riskType, product: policy.product })
  return (
    <TableRow
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${fullName}`}
      className="group cursor-pointer hover:bg-ember-soft/40 focus-visible:bg-ember-soft/40 focus-visible:outline-none"
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <TableCell className="py-3 pl-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-ember-soft text-[12px] font-semibold text-ember-2">
              {initials(policy.client.firstName, policy.client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-ink">{fullName}</div>
            <div className="text-[12px] text-muted-foreground">DNI {policy.client.dni}</div>
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
                      <span className="sr-only">Ofrecer renovación por WhatsApp</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ofrecer renovación por WhatsApp</TooltipContent>
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

// ─── Hide dialog ─────────────────────────────────────────────────────────────────

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
  const { data: profile } = useProfile()
  const orgName = profile?.organization?.name ?? 'tu productor de seguros'

  const { data, isLoading, isError, isFetching } = useExpiredPolicies({
    ...scope,
    search,
    hidden: showHidden,
    sort,
    page,
    pageSize: PAGE_SIZE,
  })
  const { hide, unhide } = useExpiredPolicyActions()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const hiddenCount = data?.hiddenCount ?? 0
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  const toggleHidden = () => {
    setShowHidden(v => !v)
    setPage(1)
  }
  const changeSort = (value: ExpiredPolicySort) => {
    setSort(value)
    setPage(1)
  }

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

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          Pólizas que vencieron en el último año y no se renovaron, sin las anuladas por Triunfo ni las que ya tienen
          otra póliza vigente.
        </p>
        <div className="flex items-center gap-2">
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
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-faint">Asegurado</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Póliza</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Venció</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint lg:table-cell">
                Medio de pago
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
                  <TableCell className="py-3 pl-5">
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
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-24 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar las pólizas vencidas.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-[14px] text-muted-foreground">
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
                  busy={busyId === policy.id}
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
    </>
  )
}
