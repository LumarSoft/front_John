'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Bell, CheckCheck, IdCard, MessageSquare, Search } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { NovedadItem, NovedadType } from '@/src/types/api/novedades'
import { formatDate } from '../lib/asegurados-ui'
import { useNovedades } from '../hooks/use-novedades'
import { useNovedadesStats } from '../hooks/use-novedades-stats'
import { useNovedadesActions } from '../hooks/use-novedades-actions'
import { SiniestroSheet } from './siniestro-sheet'
import { AseguradoSheet } from './asegurado-sheet'

type TabValue = 'todas' | NovedadType

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d} ${d === 1 ? 'día' : 'días'}`
  return formatDate(iso)
}

interface NovedadRowProps {
  novedad: NovedadItem
  onOpen: (n: NovedadItem) => void
  onOpenClient: (clientId: number) => void
}

function NovedadRow({ novedad, onOpen, onOpenClient }: NovedadRowProps) {
  const unread = novedad.readAt === null
  const isSiniestro = novedad.type === 'siniestro'
  const Icon = isSiniestro ? AlertTriangle : MessageSquare
  const client = novedad.client

  return (
    <div
      className={`flex items-start gap-3 border-b border-line-2 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-secondary/40 ${
        unread ? 'bg-ember-soft/30' : 'bg-transparent'
      }`}
    >
      <button type="button" onClick={() => onOpen(novedad)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            isSiniestro ? 'bg-destructive/10 text-destructive' : 'bg-ember-soft text-ember-2'
          }`}
        >
          <Icon className="size-4.5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {unread && <span className="size-2 shrink-0 rounded-full bg-ember-2" aria-label="No leída" />}
            <span className={`truncate text-[13.5px] ${unread ? 'font-semibold text-ink' : 'font-medium text-ink-3'}`}>
              {novedad.title}
            </span>
          </div>
          {novedad.body && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">{novedad.body}</p>}
          <span className="mt-1 block text-[11px] text-faint">
            {client ? `DNI ${client.dni} · ` : ''}
            {timeAgo(novedad.createdAt)}
          </span>
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-1.5 self-center">
        <span className="text-[11.5px] text-muted-foreground">{isSiniestro ? 'Gestionar' : 'Ver en Bandeja'}</span>
        {client && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-6 gap-1 px-2 text-[11px] text-ink-3 hover:text-ember-2"
            onClick={() => onOpenClient(client.id)}
          >
            <IdCard className="size-3.5" />
            Ver ficha
          </Button>
        )}
      </div>
    </div>
  )
}

export function NovedadesView() {
  const router = useRouter()
  const [tab, setTab] = useState<TabValue>('todas')
  const [selectedSiniestroId, setSelectedSiniestroId] = useState<number | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)

  const type = tab === 'todas' ? undefined : tab
  const { data: page, isLoading, isError } = useNovedades({ type, search, pageSize: 50 })
  const { data: stats } = useNovedadesStats()
  const { markRead, markAllRead } = useNovedadesActions()

  const handleOpen = (novedad: NovedadItem) => {
    if (novedad.readAt === null) markRead.mutate(novedad.id)
    if (novedad.type === 'siniestro') {
      setSelectedSiniestroId(novedad.refId)
    } else {
      router.push('/admin/inbox')
    }
  }

  const items = page?.data ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <Bell className="size-5 text-ember-2" />
            Novedades
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Siniestros nuevos y clientes que pidieron hablar con un asesor.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 border-line-2 text-[12.5px] text-ink-3"
          disabled={!stats || stats.unreadTotal === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate(type)}
        >
          <CheckCheck className="size-4" />
          Marcar todo como leído
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Buscar por DNI o nombre del cliente"
          className="h-9 pl-9"
        />
      </div>

      <Tabs value={tab} onValueChange={v => setTab(v as TabValue)} className="mb-4">
        <TabsList className="grid h-9 w-full grid-cols-3 rounded-lg border border-line-2 bg-secondary/50 p-0.5 sm:inline-grid sm:w-auto">
          <TabsTrigger value="todas" className="h-8 gap-1.5 rounded-md px-4 text-[12.5px]">
            Todas
            {stats && stats.unreadTotal > 0 && <CountBadge n={stats.unreadTotal} />}
          </TabsTrigger>
          <TabsTrigger value="siniestro" className="h-8 gap-1.5 rounded-md px-4 text-[12.5px]">
            Siniestros
            {stats && stats.unreadSiniestros > 0 && <CountBadge n={stats.unreadSiniestros} />}
          </TabsTrigger>
          <TabsTrigger value="handoff" className="h-8 gap-1.5 rounded-md px-4 text-[12.5px]">
            Asesor
            {stats && stats.unreadHandoff > 0 && <CountBadge n={stats.unreadHandoff} />}
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
            No se pudieron cargar las novedades.
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <CheckCheck className="size-5" />
            </div>
            <p className="text-[14px] text-muted-foreground">
              {search ? 'No hay novedades para esa búsqueda.' : 'No hay novedades por ahora.'}
            </p>
          </div>
        ) : (
          items.map(n => <NovedadRow key={n.id} novedad={n} onOpen={handleOpen} onOpenClient={setSelectedClientId} />)
        )}
      </div>

      <SiniestroSheet siniestroId={selectedSiniestroId} onClose={() => setSelectedSiniestroId(null)} />
      <AseguradoSheet clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  )
}

function CountBadge({ n }: { n: number }) {
  return (
    <Badge
      variant="secondary"
      className="h-4 min-w-4 justify-center rounded-full bg-ember-2 px-1 text-[10px] font-semibold text-on-dark"
    >
      {n}
    </Badge>
  )
}
