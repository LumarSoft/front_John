'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Phone, Search, Users } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { AdminClientSummary, ClientEstadoFilter, ClientSort, RiskType } from '@/src/types/api/clients'
import { useAdminClients } from '../hooks/use-admin-clients'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import {
  clientStatus,
  cuotaPaymentStatus,
  formatDate,
  initials,
  nearestExpiry,
  ramoSummary,
  relativeDays,
  RISK_LABELS,
  RiskIcon,
} from '../lib/asegurados-ui'
import { AseguradoSheet } from './asegurado-sheet'
import { AseguradosFilters } from './asegurados-filters'
import { AseguradosStats } from './asegurados-stats'

const PAGE_SIZE = 20

function PoliciesCell({ polizas }: { polizas: AdminClientSummary['polizas'] }) {
  if (polizas.length === 0) {
    return <span className="text-[12.5px] text-faint-2">Sin pólizas</span>
  }

  const { ramos, dominio, vigentes } = ramoSummary(polizas)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          {ramos.slice(0, 3).map(ramo => (
            <span
              key={ramo}
              title={RISK_LABELS[ramo]}
              className="flex size-6 items-center justify-center rounded-md border border-line-2 bg-secondary/60 text-ink-3"
            >
              <RiskIcon type={ramo} className="size-3.5" />
            </span>
          ))}
          {ramos.length > 3 && <span className="text-[11px] text-muted-foreground">+{ramos.length - 3}</span>}
        </div>
        {dominio && <span className="font-mono text-[12px] font-medium tracking-wider text-ink-3">{dominio}</span>}
      </div>
      <div className="text-[11.5px] text-muted-foreground">
        {polizas.length} {polizas.length === 1 ? 'póliza' : 'pólizas'} ·{' '}
        {vigentes > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            {vigentes} {vigentes === 1 ? 'vigente' : 'vigentes'}
          </span>
        ) : (
          <span className="text-destructive">sin vigentes</span>
        )}
      </div>
    </div>
  )
}

function NextExpiryCell({ polizas }: { polizas: AdminClientSummary['polizas'] }) {
  const expiry = nearestExpiry(polizas.map(p => p.vigenciaHasta))
  if (!expiry) return <span className="text-[13px] text-faint-2">—</span>

  const soon = expiry.daysLeft <= 30
  return (
    <div className="flex items-center gap-2.5">
      <span className={`size-1.5 shrink-0 rounded-full ${soon ? 'bg-amber-2' : 'bg-emerald-500'}`} />
      <div className="leading-tight">
        <div className={`text-[13px] ${soon ? 'font-medium text-amber-700 dark:text-amber' : 'text-ink-3'}`}>
          {formatDate(expiry.date.toISOString())}
        </div>
        <div className="text-[11px] text-muted-foreground">{relativeDays(expiry.daysLeft)}</div>
      </div>
    </div>
  )
}

function ClientRow({ client, onSelect }: { client: AdminClientSummary; onSelect: () => void }) {
  const status = clientStatus(client.polizas)
  const pagoStatus = cuotaPaymentStatus(client.cuotaStats)

  return (
    <TableRow className="group cursor-pointer hover:bg-ember-soft/40" onClick={onSelect}>
      <TableCell className="py-3 pl-5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="size-9">
              <AvatarFallback className="bg-ember-soft text-[12px] font-semibold text-ember-2">
                {initials(client.firstName, client.lastName)}
              </AvatarFallback>
            </Avatar>
            <span
              title={status.label}
              className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card ${status.dot}`}
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-ink">
              {client.lastName}, {client.firstName}
            </div>
            <div className="text-[12px] text-muted-foreground">DNI {client.dni}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden lg:table-cell">
        <div className="space-y-0.5">
          <div className="text-[13px] text-ink-3">{client.email}</div>
          {client.phone && (
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Phone className="size-3" />
              {client.phone}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <PoliciesCell polizas={client.polizas} />
      </TableCell>

      <TableCell className="hidden sm:table-cell">
        {pagoStatus.key !== 'sin_cuotas' && (
          <Badge className={`text-[11px] font-medium ${pagoStatus.badge}`}>{pagoStatus.label}</Badge>
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <NextExpiryCell polizas={client.polizas} />
      </TableCell>

      <TableCell className="pr-4 text-right">
        <ChevronRight className="ml-auto size-4 -translate-x-1 text-faint-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </TableCell>
    </TableRow>
  )
}

export function AseguradosView() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [riskType, setRiskType] = useState<RiskType | undefined>()
  const [estado, setEstado] = useState<ClientEstadoFilter | undefined>()
  const [sort, setSort] = useState<ClientSort>('nombre_asc')
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleScope = (value: ScopeFilterValue) => {
    setScope(value)
    setPage(1)
  }

  // Any filter/search change resets pagination back to the first page.
  const handleSearch = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }
  const handleRiskType = (value?: RiskType) => {
    setRiskType(value)
    setPage(1)
  }
  const handleEstado = (value?: ClientEstadoFilter) => {
    setEstado(value)
    setPage(1)
  }
  const handleSort = (value: ClientSort) => {
    setSort(value)
    setPage(1)
  }

  const { data, isLoading, isError, isFetching } = useAdminClients({
    search,
    riskType,
    estado,
    sort,
    ...scope,
    page,
    pageSize: PAGE_SIZE,
  })

  const clients = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Cartera</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Asegurados</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Gestioná tu cartera de asegurados, sus pólizas y vencimientos.
          </p>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2">
          <ScopeFilter value={scope} onChange={handleScope} className="shrink-0" />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar nombre, DNI, email, patente…"
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              className="h-10 border-line-2 pl-9 text-[13px]"
            />
          </div>
        </div>
      </div>

      <AseguradosStats activeEstado={estado} onSelectEstado={handleEstado} />

      <AseguradosFilters
        riskType={riskType}
        estado={estado}
        sort={sort}
        onRiskTypeChange={handleRiskType}
        onEstadoChange={handleEstado}
        onSortChange={handleSort}
      />

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className="h-11 pl-5 text-[11px] uppercase tracking-[0.12em] text-faint">Asegurado</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint lg:table-cell">
                Contacto
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Pólizas</TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint sm:table-cell">
                Pagos
              </TableHead>
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint md:table-cell">
                Próx. vencimiento
              </TableHead>
              <TableHead className="w-8 pr-4" />
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
                    <Skeleton className="h-3.5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                  <TableCell className="pr-4" />
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar los asegurados.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <Users className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">
                      {search || riskType || estado
                        ? 'No se encontraron asegurados con esos filtros.'
                        : 'Todavía no hay asegurados.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              clients.map(client => (
                <ClientRow key={client.id} client={client} onSelect={() => setSelectedId(client.id)} />
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

      <AseguradoSheet clientId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
