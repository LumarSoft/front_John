import { useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Loader2,
  MoreVertical,
  RotateCcw,
  Search,
  Send,
  StickyNote,
  Trophy,
  Undo2,
  UserPlus,
  UserX,
  XCircle,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import { ApiError } from '@/src/lib/api-client'
import type {
  Campaign,
  CampaignCandidate,
  CampaignCandidatesResponse,
  CampaignOpportunity,
  CampaignSort,
  CampaignSortField,
  CampaignSortOrder,
  CancellationReason,
  OpportunityFilter,
  OpportunityLostReason,
  UpdateOpportunityRequest,
} from '@/src/types/api/campaigns'
import type { TaskPerson } from '@/src/types/api/tasks'
import { useCampaignActions, useCampaignCandidates } from '../hooks/use-campaigns'
import { useScopeFilterState } from '../hooks/use-scope-filter-state'
import { useTaskPeople } from '../hooks/use-tasks'
import { formatDate } from '../lib/asegurados-ui'
import {
  CANCELLATION_REASON_LABELS,
  candidateMessage,
  formatPremium,
  LOST_REASON_LABELS,
  LOST_REASON_ORDER,
  OPPORTUNITY_STATUS_CLASSES,
  OPPORTUNITY_STATUS_LABELS,
  OPPORTUNITY_STATUS_ORDER,
  sendBlockedReason,
  summarizeSend,
} from '../lib/campaigns-format'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'

const PAGE_SIZE = 25
const HEAD = 'text-[11px] uppercase tracking-[0.12em] text-faint'
const COLUMNS = 7
/** What the API takes in one "Crear tarea". */
const MAX_TASKS = 50

const SELECT = 'h-9 w-full min-w-0 rounded-md border border-line-2 bg-background px-2.5 text-[12.5px] text-ink-3'
const TEXTAREA =
  'min-h-20 w-full rounded-md border border-line-2 bg-background px-2.5 py-2 text-[13px] text-ink-3 outline-none focus:border-ember-ring'

const failed = (error: unknown, fallback: string) =>
  toast.error(error instanceof ApiError && error.status < 500 ? error.message : fallback)

/**
 * The next contact of a campaign that writes more than once: highlighted when
 * it is due (the client is back on the to-do), quiet while it waits.
 */
function FollowUpBadge({ candidate }: { candidate: CampaignCandidate }) {
  const followUp = candidate.followUp
  if (!followUp || candidate.optedOut) return null
  if (!followUp.due) {
    const status = candidate.opportunity?.status
    // Answered, closed or already on the last contact: nothing else goes out.
    if ((status && status !== 'CONTACTED') || followUp.step >= followUp.of) return null
    return <div className="mt-1 text-[11px] text-muted-foreground">Sigue otro contacto si no responde</div>
  }
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
      <BellRing className="size-3" />
      {followUp.label}
    </span>
  )
}

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

/** Where the client's opportunity stands and who follows it. */
function OpportunityCell({ opportunity }: { opportunity: CampaignOpportunity | null | undefined }) {
  const status = opportunity?.status ?? 'NEW'
  const when =
    opportunity &&
    (status === 'WON'
      ? opportunity.wonAt
      : status === 'LOST'
        ? opportunity.lostAt
        : status === 'QUOTED'
          ? opportunity.quotedAt
          : status === 'REPLIED'
            ? opportunity.repliedAt
            : opportunity.contactedAt)
  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${OPPORTUNITY_STATUS_CLASSES[status]}`}
      >
        {OPPORTUNITY_STATUS_LABELS[status]}
        {when && status !== 'NEW' && <span className="ml-1 font-normal opacity-80">{formatDate(when)}</span>}
      </span>
      {opportunity?.assignedTo && (
        <div className="truncate text-[11.5px] text-ink-3">{opportunity.assignedTo.name ?? 'Sin nombre'}</div>
      )}
      {status === 'LOST' && opportunity?.lostReasonLabel && (
        <div className="text-[11px] text-muted-foreground">{opportunity.lostReasonLabel}</div>
      )}
      {status === 'WON' && opportunity?.wonPremium != null && (
        <div className="text-[11px] text-muted-foreground">Prima {formatPremium(opportunity.wonPremium)}</div>
      )}
    </div>
  )
}

/** The first order of a column: A to Z for names, newest first for dates; in Renovaciones, the soonest to end. */
function firstOrder(campaign: Campaign, by: CampaignSortField): CampaignSortOrder {
  if (by === 'name' || by === 'item') return 'asc'
  return by === 'date' && campaign.kind === 'renewal' ? 'asc' : 'desc'
}

/** A column header that sorts the list by it; tapping it again turns the order around. */
function SortableHead({
  label,
  by,
  sort,
  onSort,
  className,
}: {
  label: string
  by: CampaignSortField
  sort: CampaignSort | null
  onSort: (by: CampaignSortField) => void
  className: string
}) {
  const order = sort?.by === by ? sort.order : null
  const Icon = order === 'asc' ? ArrowUp : order === 'desc' ? ArrowDown : ArrowUpDown
  return (
    <TableHead
      className={className}
      aria-sort={order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(by)}
        title={`Ordenar por ${label.toLowerCase()}`}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.12em] transition-colors hover:text-ink ${order ? 'text-ink-3' : ''}`}
      >
        {label}
        <Icon className={order ? 'size-3.5' : 'size-3.5 opacity-40'} />
      </button>
    </TableHead>
  )
}

/**
 * The campaign's own filters, with how many clients each choice has: coverage
 * and what the client lacks in Mejora de coberturas and Venta cruzada, the
 * reason in Bajas y anulaciones.
 */
function CampaignFilterSelect({
  campaign,
  filters,
  coverage,
  gap,
  reason,
  onCoverage,
  onGap,
  onReason,
}: {
  campaign: Campaign
  filters: CampaignCandidatesResponse['filters']
  coverage: string
  gap: string
  reason: CancellationReason | ''
  onCoverage: (value: string) => void
  onGap: (value: string) => void
  onReason: (value: CancellationReason | '') => void
}) {
  const coverages = filters?.coverages ?? []
  // Keep the chosen one listed while another scope loads.
  const coverageChoices =
    coverage && !coverages.some(o => o.value === coverage) ? [{ value: coverage, count: 0 }, ...coverages] : coverages
  const gaps = filters?.gaps ?? []
  const gapChoices = gap && !gaps.some(o => o.value === gap) ? [{ value: gap, label: gap, count: 0 }, ...gaps] : gaps
  const reasons = filters?.reasons ?? []
  const reasonChoices =
    reason && !reasons.some(o => o.value === reason)
      ? [{ value: reason, label: CANCELLATION_REASON_LABELS[reason], count: 0 }, ...reasons]
      : reasons
  return (
    <div className="flex flex-col gap-2 empty:hidden sm:flex-row">
      {campaign.filters?.includes('coverage') && (
        <select
          value={coverage}
          onChange={e => onCoverage(e.target.value)}
          className={SELECT}
          aria-label="Filtrar por cobertura"
        >
          <option value="">Todas las coberturas</option>
          {coverageChoices.map(option => (
            <option key={option.value} value={option.value}>
              {option.count ? `Cobertura ${option.value} (${option.count})` : `Cobertura ${option.value}`}
            </option>
          ))}
        </select>
      )}
      {campaign.filters?.includes('gap') && (gapChoices.length > 0 || gap) && (
        <select
          value={gap}
          onChange={e => onGap(e.target.value)}
          className={SELECT}
          aria-label="Filtrar por lo que le falta"
        >
          <option value="">Le falta: cualquier cosa</option>
          {gapChoices.map(option => (
            <option key={option.value} value={option.value}>
              {option.count ? `Le falta: ${option.label} (${option.count})` : `Le falta: ${option.label}`}
            </option>
          ))}
        </select>
      )}
      {campaign.filters?.includes('reason') && (
        <select
          value={reason}
          onChange={e => onReason(e.target.value as CancellationReason | '')}
          className={SELECT}
          aria-label="Filtrar por motivo"
        >
          <option value="">Todos los motivos</option>
          {reasonChoices.map(option => (
            <option key={option.value} value={option.value}>
              {option.count ? `${option.label} (${option.count})` : option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
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

/** "Asignar a…": one person of the office for the chosen clients, or nobody. */
function AssignDialog({
  count,
  people,
  current,
  pending,
  onConfirm,
  onClose,
}: {
  count: number
  people: TaskPerson[]
  current: number | null
  pending: boolean
  onConfirm: (assignedToId: number | null) => void
  onClose: () => void
}) {
  const [chosen, setChosen] = useState<string>(current ? String(current) : '')
  return (
    <Dialog open={count > 0} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{count === 1 ? 'Asignar la oportunidad' : `Asignar ${count} oportunidades`}</DialogTitle>
          <DialogDescription>Quien la sigue la ve en «Solo las mías» y en los resultados.</DialogDescription>
        </DialogHeader>
        <select value={chosen} onChange={e => setChosen(e.target.value)} className={SELECT} aria-label="Asesor">
          <option value="">Sin asignar</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>
              {person.name ?? person.email}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={() => onConfirm(chosen ? Number(chosen) : null)}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Asignar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** "Crear tarea": one task per chosen client for one person of the office, with a day and what to do. */
function TasksDialog({
  count,
  people,
  pending,
  onConfirm,
  onClose,
}: {
  count: number
  people: TaskPerson[]
  pending: boolean
  onConfirm: (data: { assignedToId: number; dueDate?: string; note?: string }) => void
  onClose: () => void
}) {
  const [chosen, setChosen] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  return (
    <Dialog open={count > 0} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{count === 1 ? 'Crear 1 tarea' : `Crear ${count} tareas`}</DialogTitle>
          <DialogDescription>
            Una tarea por cliente en la sección Tareas, con sus datos y a quién llamar. Esa persona también queda a
            cargo de la oportunidad.
          </DialogDescription>
        </DialogHeader>
        <label className="block text-[12.5px] text-ink-3">
          Para quién
          <select value={chosen} onChange={e => setChosen(e.target.value)} className={`mt-1 ${SELECT}`}>
            <option value="">Elegí una persona</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>
                {person.name ?? person.email}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12.5px] text-ink-3">
          Para cuándo (opcional)
          <Input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="mt-1 h-9 border-line-2 text-[13px]"
          />
        </label>
        <label className="block text-[12.5px] text-ink-3">
          Qué hay que hacer (opcional)
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={1000}
            placeholder="Revisar precio, cobertura y alternativas antes de llamar…"
            className={`mt-1 ${TEXTAREA}`}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={pending || !chosen}
            onClick={() =>
              onConfirm({
                assignedToId: Number(chosen),
                ...(dueDate ? { dueDate } : {}),
                ...(note.trim() ? { note: note.trim() } : {}),
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ListTodo className="size-4" />}
            Crear
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type CloseMode = 'won' | 'lost' | 'note'

/** What came of one client's opportunity: won (and for how much), lost (and why), or just a note. */
function OutcomeDialog({
  mode,
  candidate,
  pending,
  onConfirm,
  onClose,
}: {
  mode: CloseMode | null
  candidate: CampaignCandidate | null
  pending: boolean
  onConfirm: (data: UpdateOpportunityRequest) => void
  onClose: () => void
}) {
  const [premium, setPremium] = useState('')
  const [reason, setReason] = useState<OpportunityLostReason>('PRICE')
  const [note, setNote] = useState(candidate?.opportunity?.note ?? '')
  const titles: Record<CloseMode, string> = {
    won: 'Marcar como ganada',
    lost: 'Marcar como perdida',
    note: 'Nota de la oportunidad',
  }
  const submit = () => {
    const trimmed = note.trim()
    if (mode === 'won') {
      const value = premium.replace(/\./g, '').replace(',', '.').trim()
      onConfirm({ status: 'WON', wonPremium: value ? Number(value) : null, ...(trimmed ? { note: trimmed } : {}) })
    } else if (mode === 'lost') onConfirm({ status: 'LOST', lostReason: reason, ...(trimmed ? { note: trimmed } : {}) })
    else onConfirm({ note: trimmed || null })
  }
  return (
    <Dialog open={mode !== null && candidate !== null} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode ? titles[mode] : ''}</DialogTitle>
          <DialogDescription>
            {candidate?.client.name}
            {candidate?.item ? ` · ${candidate.item}` : ''}
          </DialogDescription>
        </DialogHeader>
        {mode === 'won' && (
          <label className="block text-[12.5px] text-ink-3">
            Prima de la venta (opcional)
            <Input
              value={premium}
              onChange={e => setPremium(e.target.value)}
              inputMode="decimal"
              placeholder="Por ejemplo 85000"
              className="mt-1 h-9 border-line-2 text-[13px]"
            />
            <span className="mt-1 block text-[11.5px] text-muted-foreground">
              Si la póliza nueva ya figura en la cartera, el sistema la toma solo.
            </span>
          </label>
        )}
        {mode === 'lost' && (
          <label className="block text-[12.5px] text-ink-3">
            Por qué se perdió
            <select
              value={reason}
              onChange={e => setReason(e.target.value as OpportunityLostReason)}
              className={`mt-1 ${SELECT}`}
            >
              {LOST_REASON_ORDER.map(value => (
                <option key={value} value={value}>
                  {LOST_REASON_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block text-[12.5px] text-ink-3">
          {mode === 'note' ? 'Nota' : 'Nota (opcional)'}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={2000}
            placeholder="Qué dijo el cliente, qué quedó pendiente…"
            className={`mt-1 ${TEXTAREA}`}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-line-2">
            Cancelar
          </Button>
          <Button type="button" disabled={pending} onClick={submit}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** "Clientes": who the campaign finds, so the office ticks whom to write to and follows each one. */
export function CampaignClientsTab({ campaign }: { campaign: Campaign }) {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [scope, setScope] = useScopeFilterState()
  const [coverage, setCoverage] = useState('')
  const [reason, setReason] = useState<CancellationReason | ''>('')
  const [gap, setGap] = useState('')
  const [due, setDue] = useState(false)
  const [status, setStatus] = useState<OpportunityFilter | ''>('')
  const [mine, setMine] = useState(false)
  // Null: the API's default order, which it reports back in `data.sort`.
  const [sort, setSort] = useState<CampaignSort | null>(null)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [confirmSend, setConfirmSend] = useState(false)
  const [confirmOptOut, setConfirmOptOut] = useState(false)
  // Who to assign: the ticked rows, or one row from its menu.
  const [assigning, setAssigning] = useState<number[]>([])
  const [tasking, setTasking] = useState(false)
  const [outcome, setOutcome] = useState<{ mode: CloseMode; candidate: CampaignCandidate } | null>(null)

  const { data, isLoading, isError, isFetching } = useCampaignCandidates(
    campaign.kind,
    {
      ...scope,
      search,
      coverage: coverage || undefined,
      reason: reason || undefined,
      gap: gap || undefined,
      due: due || undefined,
      status: status || undefined,
      mine: mine || undefined,
      sort: sort?.by,
      order: sort?.order,
      page,
      pageSize: PAGE_SIZE,
    },
    campaign.plan.included,
  )
  const { send, mark, optOut, optIn, createTasks, assign, updateOpportunity } = useCampaignActions(campaign.kind)
  const { data: people = [] } = useTaskPeople()
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
  const changeCoverage = (value: string) => resetAnd(() => setCoverage(value))
  const changeReason = (value: CancellationReason | '') => resetAnd(() => setReason(value))
  const changeGap = (value: string) => resetAnd(() => setGap(value))
  const changeDue = (value: boolean) => resetAnd(() => setDue(value))
  const changeStatus = (value: OpportunityFilter | '') => resetAnd(() => setStatus(value))
  const changeMine = (value: boolean) => resetAnd(() => setMine(value))
  const shownSort = sort ?? data?.sort ?? null
  const changeSort = (by: CampaignSortField) =>
    resetAnd(() =>
      setSort(
        shownSort?.by === by
          ? { by, order: shownSort.order === 'asc' ? 'desc' : 'asc' }
          : { by, order: firstOrder(campaign, by) },
      ),
    )
  const filtered = !!(search || coverage || reason || gap || due || status || mine)
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
  const optInRow = (candidate: CampaignCandidate) =>
    optIn.mutate([candidate.id], {
      onSuccess: () => toast.success(`${candidate.client.name} vuelve a recibir campañas`),
      onError: error => failed(error, 'No se pudo guardar'),
    })
  const createTasksFor = (task: { assignedToId: number; dueDate?: string; note?: string }) =>
    createTasks.mutate(
      { ids, ...task },
      {
        onSuccess: result => {
          const who = people.find(p => p.id === task.assignedToId)?.name ?? 'esa persona'
          toast.success(
            result.created === 1 ? `1 tarea creada para ${who}` : `${result.created} tareas creadas para ${who}`,
          )
          setTasking(false)
          setSelectedIds(new Set())
        },
        onError: error => failed(error, 'No se pudieron crear las tareas'),
      },
    )
  const assignTo = (assignedToId: number | null) =>
    assign.mutate(
      { ids: assigning, assignedToId },
      {
        onSuccess: result => {
          const who = assignedToId ? (people.find(p => p.id === assignedToId)?.name ?? 'esa persona') : 'nadie'
          toast.success(
            result.assigned === 1
              ? `1 oportunidad asignada a ${who}`
              : `${result.assigned} oportunidades asignadas a ${who}`,
          )
          setAssigning([])
          setSelectedIds(new Set())
        },
        onError: error => failed(error, 'No se pudo asignar'),
      },
    )
  const saveOutcome = (candidate: CampaignCandidate, update: UpdateOpportunityRequest) =>
    updateOpportunity.mutate(
      { targetId: candidate.id, data: update },
      {
        onSuccess: result => {
          toast.success(
            update.status === 'WON'
              ? `Oportunidad ganada: ${candidate.client.name}`
              : update.status === 'LOST'
                ? `Oportunidad perdida: ${candidate.client.name}`
                : update.status === 'CONTACTED'
                  ? `Oportunidad reabierta: ${OPPORTUNITY_STATUS_LABELS[result.status]}`
                  : 'Nota guardada',
          )
          setOutcome(null)
        },
        onError: error => failed(error, 'No se pudo guardar la oportunidad'),
      },
    )
  const assigningCurrent =
    assigning.length === 1 ? (rows.find(r => r.id === assigning[0])?.opportunity?.assignedTo?.id ?? null) : null

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
          <CampaignFilterSelect
            campaign={campaign}
            filters={data?.filters}
            coverage={coverage}
            gap={gap}
            reason={reason}
            onCoverage={changeCoverage}
            onGap={changeGap}
            onReason={changeReason}
          />
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={e => changeStatus(e.target.value as OpportunityFilter | '')}
              className={SELECT}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {OPPORTUNITY_STATUS_ORDER.map(value => (
                <option key={value} value={value === 'NEW' ? 'none' : value}>
                  {OPPORTUNITY_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <label className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-3">
              <input
                type="checkbox"
                checked={mine}
                onChange={e => changeMine(e.target.checked)}
                className="size-4 accent-ember"
              />
              Solo las mías
            </label>
          </div>
          <label
            className="flex items-center gap-1.5 text-[12.5px] text-ink-3"
            title="Solo quienes todavía no fueron contactados o tienen un seguimiento pendiente"
          >
            <input
              type="checkbox"
              checked={due}
              onChange={e => changeDue(e.target.checked)}
              className="size-4 accent-ember"
            />
            Para escribir ahora
          </label>
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
            disabled={selected.length === 0 || assign.isPending}
            onClick={() => setAssigning(ids)}
            className="h-9 border-line-2 text-[12.5px]"
          >
            <UserPlus className="size-4" />
            Asignar a…{selected.length > 0 ? ` (${selected.length})` : ''}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selected.length === 0 || selected.length > MAX_TASKS || createTasks.isPending}
            onClick={() => setTasking(true)}
            title={selected.length > MAX_TASKS ? `Hasta ${MAX_TASKS} tareas por vez` : undefined}
            className="h-9 border-line-2 text-[12.5px]"
          >
            <ListTodo className="size-4" />
            Crear tarea{selected.length > 0 ? ` (${selected.length})` : ''}
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
              <SortableHead label="Cliente" by="name" sort={shownSort} onSort={changeSort} className={`pl-3 ${HEAD}`} />
              <SortableHead label="Bien" by="item" sort={shownSort} onSort={changeSort} className={HEAD} />
              <SortableHead
                label="Motivo"
                by="date"
                sort={shownSort}
                onSort={changeSort}
                className={`hidden md:table-cell ${HEAD}`}
              />
              <SortableHead
                label="Último mensaje"
                by="lastMessage"
                sort={shownSort}
                onSort={changeSort}
                className={HEAD}
              />
              <TableHead className={HEAD}>Seguimiento</TableHead>
              <TableHead className="w-10 pr-3" />
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
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="pr-3" />
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
                  {filtered
                    ? 'No se encontraron clientes con esa búsqueda o filtro.'
                    : 'Por ahora la campaña no encuentra a quién escribirle.'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(row => {
                const canTick = row.lastMessage?.status !== 'SENDING' && !row.optedOut
                const closed = row.opportunity?.status === 'WON' || row.opportunity?.status === 'LOST'
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
                          {row.optedOutBy === 'client' ? 'Pidió no recibir más mensajes' : 'No quiere recibir'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate text-[13px] text-ink-3">{row.item}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground md:hidden">{row.detail}</div>
                    </TableCell>
                    <TableCell className="hidden max-w-[260px] whitespace-normal md:table-cell">
                      <div className="text-[12.5px] text-ink-3">{row.detail}</div>
                      {row.producerCode && (
                        <div className="text-[11px] text-muted-foreground">Código {row.producerCode.code}</div>
                      )}
                      {row.customerReason && (
                        <div className="mt-0.5 truncate text-[11.5px] text-ink-3" title={row.customerReason}>
                          El cliente dijo: «{row.customerReason}»
                        </div>
                      )}
                      {row.opportunity?.note && (
                        <div
                          className="mt-0.5 flex items-start gap-1 truncate text-[11.5px] text-muted-foreground"
                          title={row.opportunity.note}
                        >
                          <StickyNote className="mt-0.5 size-3 shrink-0" />
                          <span className="truncate">{row.opportunity.note}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <LastMessageCell candidate={row} />
                      <FollowUpBadge candidate={row} />
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <OpportunityCell opportunity={row.opportunity} />
                    </TableCell>
                    <TableCell className="w-10 pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Seguimiento de ${row.client.name}`}
                          className="rounded-full p-1.5 text-muted-foreground outline-none hover:bg-secondary data-[state=open]:bg-secondary"
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-auto min-w-44">
                          <DropdownMenuItem onSelect={() => setAssigning([row.id])}>
                            <UserPlus className="size-4" /> Asignar a…
                          </DropdownMenuItem>
                          {!closed && (
                            <DropdownMenuItem onSelect={() => setOutcome({ mode: 'won', candidate: row })}>
                              <Trophy className="size-4" /> Marcar como ganada…
                            </DropdownMenuItem>
                          )}
                          {!closed && (
                            <DropdownMenuItem onSelect={() => setOutcome({ mode: 'lost', candidate: row })}>
                              <XCircle className="size-4" /> Marcar como perdida…
                            </DropdownMenuItem>
                          )}
                          {closed && (
                            <DropdownMenuItem onSelect={() => saveOutcome(row, { status: 'CONTACTED' })}>
                              <RotateCcw className="size-4" /> Reabrir
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onSelect={() => setOutcome({ mode: 'note', candidate: row })}>
                            <StickyNote className="size-4" /> {row.opportunity?.note ? 'Editar la nota…' : 'Nota…'}
                          </DropdownMenuItem>
                          {row.optedOut && (
                            <DropdownMenuItem onSelect={() => optInRow(row)}>
                              <Undo2 className="size-4" /> Volver a escribirle
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {assigning.length > 0 && (
        <AssignDialog
          count={assigning.length}
          people={people}
          current={assigningCurrent}
          pending={assign.isPending}
          onConfirm={assignTo}
          onClose={() => setAssigning([])}
        />
      )}

      {tasking && (
        <TasksDialog
          count={selected.length}
          people={people}
          pending={createTasks.isPending}
          onConfirm={createTasksFor}
          onClose={() => setTasking(false)}
        />
      )}

      {outcome && (
        <OutcomeDialog
          key={`${outcome.mode}-${outcome.candidate.id}`}
          mode={outcome.mode}
          candidate={outcome.candidate}
          pending={updateOpportunity.isPending}
          onConfirm={update => saveOutcome(outcome.candidate, update)}
          onClose={() => setOutcome(null)}
        />
      )}

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
