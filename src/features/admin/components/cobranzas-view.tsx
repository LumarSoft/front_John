'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Search,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { WhatsAppIcon } from '@/src/components/ui/brand-icons'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { CobranzaCliente, CobranzaEstadoFilter, CobranzasStats } from '@/src/types/api/cobranzas'
import { useCobranzas } from '../hooks/use-cobranzas'
import { useCobranzasStats } from '../hooks/use-cobranzas-stats'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import {
  buildCobranzaWhatsappUrl,
  formatCurrency,
  initials,
  overdueLabel,
  RISK_LABELS,
  RiskIcon,
} from '../lib/asegurados-ui'
import { AseguradoSheet } from './asegurado-sheet'

const PAGE_SIZE = 25

// ─── Debt pills ───────────────────────────────────────────────────────────────

function DebtPills({ client }: { client: CobranzaCliente }) {
  const pills = [
    { n: client.overdueCount, label: 'vencidas', cls: 'bg-destructive/10 text-destructive border-destructive/25' },
    { n: client.rejectedCount, label: 'rechazadas', cls: 'bg-destructive/10 text-destructive border-destructive/25' },
    { n: client.pendingCount, label: 'pendientes', cls: 'bg-amber/10 text-amber-700 border-amber/30 dark:text-amber' },
  ].filter(p => p.n > 0)

  if (pills.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        Al día
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map(p => (
        <span
          key={p.label}
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${p.cls}`}
        >
          {p.n} {p.label}
        </span>
      ))}
    </div>
  )
}

// ─── Row ────────────────────────────────────────────────────────────────────────

function MontoCell({ client }: { client: CobranzaCliente }) {
  const isUrgent = client.overdueCount > 0 || client.rejectedCount > 0
  const overdueText = overdueLabel(client.oldestOverdueDate)
  const owes = parseFloat(client.totalDeuda) > 0
  const unpaidCount = client.overdueCount + client.rejectedCount + client.pendingCount

  const amountCls = isUrgent
    ? 'text-destructive'
    : client.pendingCount > 0
      ? 'text-amber-700 dark:text-amber'
      : 'text-ink'

  let sublabel: string
  if (overdueText) sublabel = `Vencida ${overdueText}`
  else if (client.rejectedCount > 0) sublabel = 'Rechazada'
  else if (client.pendingCount > 0) sublabel = 'Por vencer'
  else sublabel = 'Adeudado'

  return (
    <>
      <div className={`font-display text-[16px] font-semibold leading-none ${amountCls}`}>
        {owes ? formatCurrency(client.totalDeuda) : `${unpaidCount} sin pagar`}
      </div>
      <div
        className={`mt-1 text-[10.5px] tracking-[0.1em] ${
          overdueText ? 'font-medium uppercase text-destructive' : 'uppercase text-muted-foreground'
        }`}
      >
        {sublabel}
      </div>
    </>
  )
}

function CobranzaRow({ client, onSelect }: { client: CobranzaCliente; onSelect: () => void }) {
  const fullName = `${client.lastName}, ${client.firstName}`
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
              {initials(client.firstName, client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-ink">{fullName}</div>
            <div className="text-[12px] text-muted-foreground">DNI {client.dni}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            {client.ramos.slice(0, 3).map(ramo => (
              <span
                key={ramo}
                title={RISK_LABELS[ramo]}
                className="flex size-6 items-center justify-center rounded-md border border-line-2 bg-secondary/60 text-ink-3"
              >
                <RiskIcon type={ramo} className="size-3.5" />
              </span>
            ))}
          </div>
          {client.dominio && (
            <span className="font-mono text-[12px] font-medium tracking-wider text-ink-3">{client.dominio}</span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <DebtPills client={client} />
      </TableCell>

      <TableCell className="text-right">
        <MontoCell client={client} />
      </TableCell>

      <TableCell className="pr-4 text-right">
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
            {client.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                  >
                    <a href={buildCobranzaWhatsappUrl(client.phone, client)} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-4" />
                      <span className="sr-only">Recordar pago por WhatsApp</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Recordar pago por WhatsApp</TooltipContent>
              </Tooltip>
            )}
            {client.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2"
                  >
                    <a href={`tel:${client.phone}`}>
                      <Phone className="size-4" />
                      <span className="sr-only">Llamar</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Llamar</TooltipContent>
              </Tooltip>
            )}
            {client.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="hidden size-8 rounded-full text-ink-3 hover:bg-ember-soft hover:text-ember-2 sm:inline-flex"
                  >
                    <a href={`mailto:${client.email}`}>
                      <Mail className="size-4" />
                      <span className="sr-only">Enviar email</span>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar email</TooltipContent>
              </Tooltip>
            )}
            <ChevronRight className="size-4 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  )
}

// ─── KPI cards ────────────────────────────────────────────────────────────────

interface Kpi {
  key: string
  label: string
  value: string
  icon: typeof Wallet
  tone: 'destructive' | 'amber' | 'emerald' | 'neutral'
}

const KPI_TONES: Record<Kpi['tone'], string> = {
  destructive: 'bg-destructive/10 text-destructive',
  amber: 'bg-amber/15 text-amber-700 dark:text-amber',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  neutral: 'bg-ember-soft text-ember-2',
}

function buildKpis(stats: CobranzasStats): Kpi[] {
  return [
    {
      key: 'deuda',
      label: 'Deuda total',
      value: formatCurrency(stats.montoDeudaTotal),
      icon: Wallet,
      tone: 'destructive',
    },
    {
      key: 'deudores',
      label: 'Clientes con deuda',
      value: String(stats.clientesConDeuda),
      icon: Users,
      tone: 'neutral',
    },
    {
      key: 'vencidas',
      label: 'Cuotas vencidas',
      value: String(stats.cuotasVencidas),
      icon: AlertTriangle,
      tone: 'destructive',
    },
    {
      key: 'rechazadas',
      label: 'Cuotas rechazadas',
      value: String(stats.cuotasRechazadas),
      icon: Ban,
      tone: 'amber',
    },
  ]
}

function KpiRow({ stats }: { stats?: CobranzasStats }) {
  if (!stats) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[78px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {buildKpis(stats).map(kpi => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.key} className="flex flex-row items-center gap-3 border-line-2 p-3.5 shadow-sm">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${KPI_TONES[kpi.tone]}`}>
              <Icon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-[22px] leading-none tracking-tight text-ink">{kpi.value}</div>
              <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{kpi.label}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Segmented filter ───────────────────────────────────────────────────────────

const FILTERS: { value: CobranzaEstadoFilter; label: string }[] = [
  { value: 'vencidas', label: 'Vencidas' },
  { value: 'rechazadas', label: 'Rechazadas' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'todas', label: 'Toda la deuda' },
]

function filterCount(stats: CobranzasStats | undefined, value: CobranzaEstadoFilter): number {
  if (!stats) return 0
  switch (value) {
    case 'vencidas':
      return stats.clientesVencidas
    case 'rechazadas':
      return stats.clientesRechazadas
    case 'pendientes':
      return stats.clientesPendientes
    case 'todas':
      return stats.clientesConDeuda
  }
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function CobranzasView() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [filter, setFilter] = useState<CobranzaEstadoFilter>('vencidas')
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleSearch = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }
  const handleFilter = (value: CobranzaEstadoFilter) => {
    setFilter(value)
    setPage(1)
  }
  const handleScope = (value: ScopeFilterValue) => {
    setScope(value)
    setPage(1)
  }

  const { data, isLoading, isError, isFetching } = useCobranzas({
    search,
    estado: filter,
    ...scope,
    page,
    pageSize: PAGE_SIZE,
  })
  const { data: stats } = useCobranzasStats()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Gestión de pagos</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Cobranzas</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Seguimiento de la deuda de tu cartera. Identificá a quién contactar y resolvé los pagos pendientes.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <ScopeFilter value={scope} onChange={handleScope} className="w-full" />
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar nombre, DNI, email, patente…"
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              className="h-10 border-line-2 px-9 text-[13px]"
            />
            {isFetching && !isLoading && searchInput ? (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : searchInput ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => handleSearch('')}
                className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <KpiRow stats={stats} />

      {/* Segmented filter — fixed equal-width columns, no reflow */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-line-2 bg-secondary/50 p-1 sm:max-w-2xl sm:grid-cols-4">
        {FILTERS.map(option => {
          const active = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => handleFilter(option.value)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                active ? 'bg-background text-ink shadow-sm' : 'text-muted-foreground hover:text-ink'
              }`}
            >
              {option.label}
              <span
                className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                  active ? 'bg-ember-soft text-ember-2' : 'bg-line-2 text-muted-foreground'
                }`}
              >
                {filterCount(stats, option.value)}
              </span>
            </button>
          )
        })}
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-faint">Asegurado</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint lg:table-cell">
                Pólizas
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Estado de deuda</TableHead>
              <TableHead className="text-right text-[11px] uppercase tracking-[0.12em] text-faint">Monto</TableHead>
              <TableHead className="pr-5 text-right text-[11px] uppercase tracking-[0.12em] text-faint">
                Contacto
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
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-5 w-20" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-8 w-16 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-[14px] text-destructive">
                  No se pudo cargar la cartera de cobranzas.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">
                      {search
                        ? 'No se encontraron asegurados con deuda para esa búsqueda.'
                        : 'No hay cuotas en este estado. Tu cartera está al día.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(client => (
                <CobranzaRow key={client.id} client={client} onSelect={() => setSelectedId(client.id)} />
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
            de <span className="font-medium text-ink-3">{total}</span> {total === 1 ? 'asegurado' : 'asegurados'}
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

      <AseguradoSheet clientId={selectedId} onClose={() => setSelectedId(null)} defaultTab="pagos" />
    </div>
  )
}
