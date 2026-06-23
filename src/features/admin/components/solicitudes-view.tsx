'use client'

import { useState } from 'react'
import { ClipboardList, Phone, Search } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { SolicitudListItem, SolicitudKind, SolicitudStatus } from '@/src/types/api/solicitudes'
import { useSolicitudes } from '../hooks/use-solicitudes'
import { SolicitudSheet } from './solicitud-sheet'
import { PRODUCT_LABELS, productLabel, STATUS_LABELS, statusBadgeVariant, timeAgo } from '../lib/solicitudes-ui'

type StatusTab = 'todas' | SolicitudStatus

function SolicitudRow({ item, onOpen }: { item: SolicitudListItem; onOpen: (i: SolicitudListItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex w-full items-start gap-3 border-b border-line-2 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-secondary/40"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ember-soft text-ember-2">
        <ClipboardList className="size-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold text-ink">{item.contactName}</span>
          <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10.5px]">
            {productLabel(item.productType)}
          </Badge>
          {item.kind === 'cotizacion' && (
            <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">
              online
            </Badge>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted-foreground">
          {item.summary ?? 'Solicitud de cotización'}
        </p>
        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-faint">
          <Phone className="size-3" />
          {item.phone}
          {item.channel ? ` · ${item.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'}` : ''} · {timeAgo(item.createdAt)}
        </span>
      </div>

      <Badge variant={statusBadgeVariant(item.status)} className="mt-0.5 h-5 shrink-0 px-2 text-[10.5px]">
        {STATUS_LABELS[item.status]}
      </Badge>
    </button>
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
          <ClipboardList className="size-5 text-ember-2" />
          Solicitudes de cotización
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Pedidos de cotización de la web y el bot — auto/moto, productos con asesor y planes fijos.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email"
            className="h-9 pl-9"
          />
        </div>
        <select
          value={productType}
          onChange={e => setProductType(e.target.value)}
          className="h-9 rounded-md border border-line-2 bg-paper px-3 text-[13px] text-ink outline-none focus:border-ember"
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
          className="h-9 rounded-md border border-line-2 bg-paper px-3 text-[13px] text-ink outline-none focus:border-ember"
        >
          <option value="">Todo origen</option>
          <option value="cotizacion">Cotización online</option>
          <option value="lead">Lead / asesor</option>
        </select>
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as StatusTab)} className="mb-4">
        <TabsList className="grid h-9 w-full grid-cols-4 rounded-lg border border-line-2 bg-secondary/50 p-0.5 sm:inline-grid sm:w-auto">
          <TabsTrigger value="todas" className="h-8 rounded-md px-4 text-[12.5px]">
            Todas
          </TabsTrigger>
          <TabsTrigger value="NEW" className="h-8 rounded-md px-4 text-[12.5px]">
            Nuevas
          </TabsTrigger>
          <TabsTrigger value="CONTACTED" className="h-8 rounded-md px-4 text-[12.5px]">
            Contactadas
          </TabsTrigger>
          <TabsTrigger value="CLOSED" className="h-8 rounded-md px-4 text-[12.5px]">
            Cerradas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        {isLoading ? (
          <div className="divide-y divide-line-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="px-4 py-12 text-center text-[13px] text-destructive">
            No se pudieron cargar las solicitudes.
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ClipboardList className="size-5" />
            </div>
            <p className="text-[14px] text-muted-foreground">
              {search || productType || kind ? 'No hay solicitudes para ese filtro.' : 'No hay solicitudes por ahora.'}
            </p>
          </div>
        ) : (
          items.map(item => (
            <SolicitudRow
              key={`${item.kind}-${item.id}`}
              item={item}
              onOpen={i => setTarget({ kind: i.kind, id: i.id })}
            />
          ))
        )}
      </div>

      <SolicitudSheet target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
