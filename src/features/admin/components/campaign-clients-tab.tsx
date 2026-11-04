import { useState } from 'react'
import { AlertCircle, Ban, CheckCheck, ChevronLeft, ChevronRight, Loader2, Search, Send, UserX } from 'lucide-react'
import { toast } from 'sonner'
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
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import { ApiError } from '@/src/lib/api-client'
import type { Campaign, CampaignCandidate } from '@/src/types/api/campaigns'
import { useCampaignActions, useCampaignCandidates } from '../hooks/use-campaigns'
import { useScopeFilterState } from '../hooks/use-scope-filter-state'
import { formatDate } from '../lib/asegurados-ui'
import { candidateMessage, sendBlockedReason, summarizeSend } from '../lib/campaigns-format'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'

const PAGE_SIZE = 25
const HEAD = 'text-[11px] uppercase tracking-[0.12em] text-faint'
const COLUMNS = 5

const failed = (error: unknown, fallback: string) =>
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)

/** The last message of the campaign to this client, whatever became of it. */
function LastMessageCell({ candidate }: { candidate: CampaignCandidate }) {
  const message = candidate.lastMessage
  if (!message) return <span className="text-[12px] text-muted-foreground">—</span>
  const when = formatDate(message.sentAt ?? message.createdAt)
  switch (message.status) {
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
            Enviado
          </span>
          <div className="text-[11px] text-muted-foreground">{when}</div>
        </div>
      )
    case 'MARKED':
      return (
        <div className="text-[12px] text-emerald-600 dark:text-emerald-400">
          <span className="inline-flex items-center gap-1">
            <CheckCheck className="size-3.5" />
            Contactado
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
            <TooltipContent className="max-w-xs">{message.error ?? 'No se pudo enviar el mensaje.'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
  }
}

/** "Enviar": how many go out, and the message as the first client will read it. */
function SendDialog({
  campaign,
  candidates,
  pending,
  onConfirm,
  onClose,
}: {
  campaign: Campaign
  candidates: CampaignCandidate[]
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const sample = candidates[0]
  return (
    <Dialog open={candidates.length > 0} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {candidates.length === 1
              ? 'Enviar 1 mensaje por WhatsApp'
              : `Enviar ${candidates.length} mensajes por WhatsApp`}
          </DialogTitle>
          <DialogDescription>
            Cada cliente recibe este mensaje con sus datos. Lo que responda llega a la bandeja de Whatsapp.
          </DialogDescription>
        </DialogHeader>
        {sample && (
          <div className="whitespace-pre-wrap rounded-lg border border-line-2 bg-secondary/40 p-3 text-[13px] leading-relaxed text-ink-3">
            {candidateMessage(campaign, sample)}
          </div>
        )}
        <p className="text-[12px] text-muted-foreground">Meta cobra cada mensaje de campaña como marketing.</p>
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

/** "Clientes": who the campaign finds, so the office ticks whom to write to. */
export function CampaignClientsTab({ campaign }: { campaign: Campaign }) {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [scope, setScope] = useScopeFilterState()
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmSend, setConfirmSend] = useState(false)
  const [confirmOptOut, setConfirmOptOut] = useState(false)

  const { data, isLoading, isError, isFetching } = useCampaignCandidates(
    campaign.kind,
    { ...scope, search, page, pageSize: PAGE_SIZE },
    campaign.plan.included,
  )
  const { send, mark, optOut } = useCampaignActions(campaign.kind)
  const blocked = sendBlockedReason(campaign)

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  // Only what is on screen can be acted on; a client going out right now or who said no is left alone.
  const selectable = rows.filter(row => row.lastMessage?.status !== 'SENDING' && !row.optedOut)
  const selected = selectable.filter(row => selectedIds.has(row.id))
  const allSelected = selectable.length > 0 && selected.length === selectable.length
  const ids = selected.map(row => row.id)

  const resetAnd = (change: () => void) => {
    change()
    setSelectedIds(new Set())
    setPage(1)
  }
  const changeScope = (value: ScopeFilterValue) => resetAnd(() => setScope(value))
  const changeSearch = (value: string) => resetAnd(() => setSearchInput(value))
  const changePage = (next: number) => {
    setPage(next)
    setSelectedIds(new Set())
  }
  const toggle = (id: number) =>
    setSelectedIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectable.map(row => row.id)))

  const sendSelected = () =>
    send.mutate(ids, {
      onSuccess: result => {
        toast.success(summarizeSend(result))
        setConfirmSend(false)
        setSelectedIds(new Set())
      },
      onError: error => failed(error, 'No se pudieron enviar los mensajes'),
    })
  const markSelected = () =>
    mark.mutate(ids, {
      onSuccess: result => {
        toast.success(
          result.marked === 1
            ? '1 cliente marcado como contactado'
            : `${result.marked} clientes marcados como contactados`,
        )
        setSelectedIds(new Set())
      },
      onError: error => failed(error, 'No se pudieron marcar los clientes'),
    })
  const optOutSelected = () =>
    optOut.mutate(ids, {
      onSuccess: result => {
        toast.success(
          result.optedOut === 1
            ? 'No le vamos a ofrecer más campañas a 1 cliente'
            : `No les vamos a ofrecer más campañas a ${result.optedOut} clientes`,
        )
        setConfirmOptOut(false)
        setSelectedIds(new Set())
      },
      onError: error => failed(error, 'No se pudo guardar'),
    })

  if (!campaign.plan.included) {
    return (
      <div className="rounded-xl border border-line-2 bg-secondary/30 px-5 py-10 text-center text-[13.5px] text-muted-foreground">
        {blocked}
        {!campaign.plan.byRole && ' El plan de cada número se elige en Facturación.'}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex w-full flex-col gap-2 sm:max-w-sm">
          <ScopeFilter value={scope} onChange={changeScope} className="w-full" />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <Input
              value={searchInput}
              onChange={e => changeSearch(e.target.value)}
              placeholder="Buscar nombre, DNI, patente…"
              className="h-9 border-line-2 pl-9 text-[13px]"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={selected.length === 0 || !!blocked || send.isPending}
                    onClick={() => setConfirmSend(true)}
                    className="h-9 text-[12.5px]"
                  >
                    <Send className="size-4" />
                    Enviar{selected.length > 0 ? ` (${selected.length})` : ''}
                  </Button>
                </span>
              </TooltipTrigger>
              {blocked && <TooltipContent className="max-w-xs">{blocked}</TooltipContent>}
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
            Ya lo contactamos{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selected.length === 0 || optOut.isPending}
            onClick={() => setConfirmOptOut(true)}
            className="h-9 border-line-2 text-[12.5px]"
          >
            <UserX className="size-4" />
            No escribirle más{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className="h-11 w-10 pl-4 pr-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={selectable.length === 0}
                  onChange={toggleAll}
                  aria-label="Elegir todos los clientes de la página"
                  className="size-4 accent-ember"
                />
              </TableHead>
              <TableHead className={`pl-3 ${HEAD}`}>Cliente</TableHead>
              <TableHead className={HEAD}>Bien</TableHead>
              <TableHead className={`hidden md:table-cell ${HEAD}`}>Motivo</TableHead>
              <TableHead className={`pr-5 ${HEAD}`}>Último mensaje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4 pr-0" />
                  <TableCell className="py-3 pl-3">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={COLUMNS} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar los clientes de la campaña.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS} className="py-16 text-center text-[14px] text-muted-foreground">
                  {search
                    ? 'No se encontraron clientes para esa búsqueda.'
                    : 'Por ahora la campaña no encuentra a quién escribirle.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(row => {
                const canTick = row.lastMessage?.status !== 'SENDING' && !row.optedOut
                return (
                  <TableRow key={row.id} className={selectedIds.has(row.id) ? 'bg-ember-soft/30' : ''}>
                    <TableCell className="w-10 pl-4 pr-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        disabled={!canTick}
                        onChange={() => toggle(row.id)}
                        aria-label={`Elegir a ${row.client.name}`}
                        className="size-4 accent-ember"
                      />
                    </TableCell>
                    <TableCell className="max-w-[220px] py-3 pl-3">
                      <div className="truncate text-[13.5px] font-medium text-ink">{row.client.name}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground">
                        {[row.client.dni && `DNI ${row.client.dni}`, row.client.phone].filter(Boolean).join(' · ') ||
                          'Sin datos de contacto'}
                      </div>
                      {row.optedOut && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-line-2 bg-secondary px-1.5 py-0.5 text-[10.5px] text-muted-foreground">
                          <Ban className="size-3" />
                          No quiere recibir
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate text-[13px] text-ink-3">{row.item}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground md:hidden">{row.detail}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-[12.5px] text-ink-3">{row.detail}</div>
                      {row.producerCode && (
                        <div className="text-[11px] text-muted-foreground">Código {row.producerCode.code}</div>
                      )}
                    </TableCell>
                    <TableCell className="pr-5">
                      <LastMessageCell candidate={row} />
                    </TableCell>
                  </TableRow>
                )
              })}
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
            de <span className="font-medium text-ink-3">{total}</span> {total === 1 ? 'cliente' : 'clientes'}
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

      <SendDialog
        campaign={campaign}
        candidates={confirmSend ? selected : []}
        pending={send.isPending}
        onConfirm={sendSelected}
        onClose={() => setConfirmSend(false)}
      />

      <AlertDialog open={confirmOptOut} onOpenChange={open => !open && setConfirmOptOut(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selected.length === 1
                ? 'No escribirle más a 1 cliente'
                : `No escribirles más a ${selected.length} clientes`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              No les vamos a ofrecer ninguna campaña más. Los avisos de rechazos y de pólizas vencidas no cambian.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={optOutSelected} disabled={optOut.isPending}>
              No escribirles más
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
