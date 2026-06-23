'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileWarning,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { AdminSiniestroDetail, SiniestroEstado, SiniestroEstadoFilter } from '@/src/services/siniestros.service'
import { formatDate, initials, RISK_LABELS, RiskIcon } from '../lib/asegurados-ui'
import { useAdminSiniestros } from '../hooks/use-admin-siniestros'
import { useAdminSiniestrosStats } from '../hooks/use-admin-siniestros-stats'
import { SiniestroSheet } from './siniestro-sheet'

const PAGE_SIZE = 25

const TIPO_LABELS: Record<string, string> = {
  auto: 'Auto',
  hogar: 'Hogar',
  robo: 'Robo',
  otro: 'Otro',
}

const ESTADO_META: Record<SiniestroEstado, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-amber/15 text-amber-700 border-amber/30 dark:text-amber' },
  en_proceso: {
    label: 'En proceso',
    cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  },
  resuelto: {
    label: 'Resuelto',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  },
}

function EstadoBadge({ estado }: { estado: SiniestroEstado }) {
  const meta = ESTADO_META[estado]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${meta.cls}`}
    >
      {meta.label}
    </span>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function SiniestroRow({ siniestro, onSelect }: { siniestro: AdminSiniestroDetail; onSelect: () => void }) {
  const fullName = `${siniestro.client.lastName}, ${siniestro.client.firstName}`
  const vehiculo = siniestro.poliza.vehiculo
  const vehiculoLabel = vehiculo ? [vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') : ''

  return (
    <TableRow
      role="button"
      tabIndex={0}
      aria-label={`Gestionar siniestro de ${fullName}`}
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
              {initials(siniestro.client.firstName, siniestro.client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-medium text-ink">{fullName}</div>
            <div className="text-[12px] text-muted-foreground">DNI {siniestro.client.dni}</div>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <span
            title={RISK_LABELS[siniestro.poliza.riskType]}
            className="flex size-6 items-center justify-center rounded-md border border-line-2 bg-secondary/60 text-ink-3"
          >
            <RiskIcon type={siniestro.poliza.riskType} className="size-3.5" />
          </span>
          <div className="min-w-0">
            {vehiculoLabel && <div className="truncate text-[13px] text-ink-3">{vehiculoLabel}</div>}
            <div className="text-[11.5px] text-muted-foreground">
              #{siniestro.poliza.certificado}
              {vehiculo?.dominio ? ` · ${vehiculo.dominio}` : ''}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-[13px] text-ink-3">{TIPO_LABELS[siniestro.tipo] ?? siniestro.tipo}</div>
        <div className="text-[11.5px] text-muted-foreground">{formatDate(siniestro.fecha)}</div>
      </TableCell>

      <TableCell>
        <EstadoBadge estado={siniestro.estado} />
      </TableCell>

      <TableCell className="pr-5 text-right">
        <div className="flex items-center justify-end gap-2">
          {siniestro.nroSiniestroCompania ? (
            <span className="font-mono text-[12.5px] text-ink-3">{siniestro.nroSiniestroCompania}</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-amber-700 dark:text-amber">
              <FileWarning className="size-3.5" />
              Sin N°
            </span>
          )}
          <ChevronRight className="size-4 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </TableCell>
    </TableRow>
  )
}

// ─── KPI cards ────────────────────────────────────────────────────────────────

interface Kpi {
  key: string
  label: string
  value: number
  icon: typeof Clock
  tone: 'amber' | 'sky' | 'emerald' | 'destructive'
}

const KPI_TONES: Record<Kpi['tone'], string> = {
  amber: 'bg-amber/15 text-amber-700 dark:text-amber',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  destructive: 'bg-destructive/10 text-destructive',
}

function KpiRow({
  stats,
}: {
  stats?: { pendientes: number; enProceso: number; resueltos: number; sinNroCompania: number }
}) {
  if (!stats) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[78px] rounded-xl" />
        ))}
      </div>
    )
  }

  const kpis: Kpi[] = [
    { key: 'pend', label: 'Pendientes', value: stats.pendientes, icon: Clock, tone: 'amber' },
    { key: 'proc', label: 'En proceso', value: stats.enProceso, icon: RefreshCw, tone: 'sky' },
    { key: 'resu', label: 'Resueltos', value: stats.resueltos, icon: CheckCircle2, tone: 'emerald' },
    { key: 'sinnro', label: 'Sin N° compañía', value: stats.sinNroCompania, icon: FileWarning, tone: 'destructive' },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map(kpi => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.key} className="flex flex-row items-center gap-3 border-line-2 p-3.5 shadow-sm">
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${KPI_TONES[kpi.tone]}`}>
              <Icon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[22px] leading-none tracking-tight text-ink">{kpi.value}</div>
              <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{kpi.label}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Segmented filter ───────────────────────────────────────────────────────────

const FILTERS: { value: SiniestroEstadoFilter; label: string }[] = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto', label: 'Resueltos' },
  { value: 'todos', label: 'Todos' },
]

function filterCount(
  stats: { pendientes: number; enProceso: number; resueltos: number } | undefined,
  value: SiniestroEstadoFilter,
): number {
  if (!stats) return 0
  switch (value) {
    case 'pendiente':
      return stats.pendientes
    case 'en_proceso':
      return stats.enProceso
    case 'resuelto':
      return stats.resueltos
    case 'todos':
      return stats.pendientes + stats.enProceso + stats.resueltos
  }
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function SiniestrosView() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [filter, setFilter] = useState<SiniestroEstadoFilter>('pendiente')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleSearch = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }
  const handleFilter = (value: SiniestroEstadoFilter) => {
    setFilter(value)
    setPage(1)
  }

  const { data, isLoading, isError, isFetching } = useAdminSiniestros({
    search,
    estado: filter === 'todos' ? undefined : filter,
    page,
    pageSize: PAGE_SIZE,
  })
  const { data: stats } = useAdminSiniestrosStats()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Gestión de reclamos</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">Siniestros</h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Seguí las denuncias de tu cartera, cargá el número de compañía y actualizá su estado.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar nombre, DNI, certificado o N°…"
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

      <KpiRow stats={stats} />

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
              <TableHead className="hidden text-[11px] uppercase tracking-[0.12em] text-faint md:table-cell">
                Póliza
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Tipo / Fecha</TableHead>
              <TableHead className="text-[11px] uppercase tracking-[0.12em] text-faint">Estado</TableHead>
              <TableHead className="pr-5 text-right text-[11px] uppercase tracking-[0.12em] text-faint">
                N° compañía
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
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="pr-5">
                    <Skeleton className="ml-auto h-5 w-20" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-[14px] text-destructive">
                  No se pudieron cargar los siniestros.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <p className="text-[14px] text-muted-foreground">
                      {search ? 'No se encontraron siniestros para esa búsqueda.' : 'No hay siniestros en este estado.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map(siniestro => (
                <SiniestroRow key={siniestro.id} siniestro={siniestro} onSelect={() => setSelectedId(siniestro.id)} />
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
            de <span className="font-medium text-ink-3">{total}</span> {total === 1 ? 'siniestro' : 'siniestros'}
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

      <SiniestroSheet siniestroId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
