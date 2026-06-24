'use client'

import { useState } from 'react'
import { ChevronRight, ClipboardList, Globe, Phone, Search, Zap } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { SolicitudListItem, SolicitudKind, SolicitudStatus } from '@/src/types/api/solicitudes'
import { useSolicitudes } from '../hooks/use-solicitudes'
import { SolicitudDialog } from './solicitud-dialog'
import { StatusPill } from './solicitud-status-pill'
import { PRODUCT_LABELS, productLabel, timeAgo } from '../lib/solicitudes-ui'

type StatusTab = 'todas' | SolicitudStatus

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'NEW', label: 'Nuevas' },
  { value: 'CONTACTED', label: 'Contactadas' },
  { value: 'CLOSED', label: 'Cerradas' },
]

const TH = 'px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint'

function SolicitudTableRow({ item, onOpen }: { item: SolicitudListItem; onOpen: (i: SolicitudListItem) => void }) {
  const online = item.kind === 'cotizacion'
  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(item)
        }
      }}
      className="group cursor-pointer border-b border-line/70 transition-colors last:border-b-0 hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none"
    >
      {/* Solicitante */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              online ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-ember-soft text-ember-2',
            )}
          >
            {online ? <Zap className="size-4.5" /> : <ClipboardList className="size-4.5" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold text-ink">{item.contactName}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-faint">
              <Phone className="size-3" />
              {item.phone}
            </div>
          </div>
        </div>
      </td>

      {/* Producto */}
      <td className="px-4 py-3">
        <Badge variant="outline" className="h-5 px-1.5 text-[10.5px]">
          {productLabel(item.productType)}
        </Badge>
      </td>

      {/* Detalle */}
      <td className="hidden max-w-[280px] px-4 py-3 md:table-cell">
        <span className="line-clamp-1 text-[12.5px] text-muted-foreground">
          {item.summary ?? 'Solicitud de cotización'}
        </span>
      </td>

      {/* Origen */}
      <td className="hidden px-4 py-3 lg:table-cell">
        <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
          {item.channel === 'WHATSAPP' ? <Phone className="size-3.5" /> : <Globe className="size-3.5" />}
          {item.channel ? (item.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web') : online ? 'Online' : '—'}
        </span>
      </td>

      {/* Recibido */}
      <td className="hidden whitespace-nowrap px-4 py-3 text-[12.5px] text-muted-foreground sm:table-cell">
        {timeAgo(item.createdAt)}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <StatusPill status={item.status} />
      </td>

      <td className="w-8 pr-3">
        <ChevronRight className="size-4 text-faint transition-colors group-hover:text-muted-foreground" />
      </td>
    </tr>
  )
}

export function SolicitudesView() {
  const [tab, setTab] = useState<StatusTab>('todas')
  const [productType, setProductType] = useState<string>('')
  const [kind, setKind] = useState<SolicitudKind | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [target, setTarget] = useState<{ kind: SolicitudKind; id: number } | null>(null)

  const status = tab === 'todas' ? undefined : tab
  const {
    data: page,
    isLoading,
    isError,
  } = useSolicitudes({
    status,
    productType: productType || undefined,
    kind: kind || undefined,
    search,
    pageSize: 50,
  })

  const items = page?.data ?? []
  const hasFilters = Boolean(search || productType || kind)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <ClipboardList className="size-5 text-ember-2" />
            Solicitudes de cotización
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pedidos de la web y el bot — auto/moto, productos con asesor y planes fijos.
          </p>
        </div>
        {!isLoading && !isError && (
          <span className="text-[12.5px] text-muted-foreground">
            {page?.total ?? items.length} {(page?.total ?? items.length) === 1 ? 'pedido' : 'pedidos'}
          </span>
        )}
      </header>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line-2 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-secondary/60 p-1 lg:w-auto">
            {STATUS_TABS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors lg:px-4',
                  tab === t.value ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-ink',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre, teléfono o email"
                className="h-9 pl-8.5 text-[13px]"
              />
            </div>
            <select
              value={productType}
              onChange={e => setProductType(e.target.value)}
              className="h-9 rounded-md border border-line-2 bg-paper px-2.5 text-[12.5px] text-ink outline-none focus:border-ember"
            >
              <option value="">Todos los productos</option>
              {Object.entries(PRODUCT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={kind}
              onChange={e => setKind(e.target.value as SolicitudKind | '')}
              className="h-9 rounded-md border border-line-2 bg-paper px-2.5 text-[12.5px] text-ink outline-none focus:border-ember"
            >
              <option value="">Todo origen</option>
              <option value="cotizacion">Cotización online</option>
              <option value="lead">Lead / asesor</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isError ? (
          <div className="px-4 py-16 text-center text-[13px] text-destructive">
            No se pudieron cargar las solicitudes.
          </div>
        ) : !isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ClipboardList className="size-5" />
            </div>
            <p className="text-[13.5px] text-muted-foreground">
              {hasFilters ? 'No hay solicitudes para ese filtro.' : 'No hay solicitudes por ahora.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-line-2 bg-secondary/30">
                  <th className={TH}>Solicitante</th>
                  <th className={TH}>Producto</th>
                  <th className={cn(TH, 'hidden md:table-cell')}>Detalle</th>
                  <th className={cn(TH, 'hidden lg:table-cell')}>Origen</th>
                  <th className={cn(TH, 'hidden sm:table-cell')}>Recibido</th>
                  <th className={TH}>Estado</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-line/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-lg" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-3.5 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <Skeleton className="h-3.5 w-40" />
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <Skeleton className="h-3.5 w-20" />
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <Skeleton className="h-3.5 w-16" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </td>
                        <td />
                      </tr>
                    ))
                  : items.map(item => (
                      <SolicitudTableRow
                        key={`${item.kind}-${item.id}`}
                        item={item}
                        onOpen={i => setTarget({ kind: i.kind, id: i.id })}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SolicitudDialog target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
