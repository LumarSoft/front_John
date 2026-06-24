'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Bell, CheckCheck, ChevronRight, IdCard, MessageSquare, Search } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import type { NovedadItem, NovedadType } from '@/src/types/api/novedades'
import { formatDate } from '../lib/asegurados-ui'
import { useNovedades } from '../hooks/use-novedades'
import { useNovedadesStats } from '../hooks/use-novedades-stats'
import { useNovedadesActions } from '../hooks/use-novedades-actions'
import { SiniestroSheet } from './siniestro-sheet'
import { AseguradoSheet } from './asegurado-sheet'

type TabValue = 'todas' | NovedadType

const TH = 'px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint'

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

function NovedadTableRow({ novedad, onOpen, onOpenClient }: NovedadRowProps) {
  const unread = novedad.readAt === null
  const isSiniestro = novedad.type === 'siniestro'
  const Icon = isSiniestro ? AlertTriangle : MessageSquare
  const client = novedad.client

  return (
    <tr
      role="button"
      tabIndex={0}
      onClick={() => onOpen(novedad)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(novedad)
        }
      }}
      className={cn(
        'group cursor-pointer border-b border-line/70 transition-colors last:border-b-0 hover:bg-secondary/40 focus-visible:bg-secondary/40 focus-visible:outline-none',
        unread && 'bg-ember-soft/25',
      )}
    >
      {/* Novedad */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              isSiniestro ? 'bg-destructive/10 text-destructive' : 'bg-ember-soft text-ember-2',
            )}
          >
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {unread && <span className="size-2 shrink-0 rounded-full bg-ember-2" aria-label="No leída" />}
              <span
                className={cn('truncate text-[13.5px]', unread ? 'font-semibold text-ink' : 'font-medium text-ink-3')}
              >
                {novedad.title}
              </span>
            </div>
            {novedad.body && (
              <p className="mt-0.5 line-clamp-1 max-w-[420px] text-[12.5px] text-muted-foreground">{novedad.body}</p>
            )}
          </div>
        </div>
      </td>

      {/* Tipo */}
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn(
            'h-5 gap-1 px-1.5 text-[10.5px]',
            isSiniestro
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-ember/25 bg-ember-soft text-ember-2',
          )}
        >
          {isSiniestro ? 'Siniestro' : 'Asesor'}
        </Badge>
      </td>

      {/* Cliente */}
      <td className="hidden px-4 py-3 md:table-cell">
        {client ? (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              onOpenClient(client.id)
            }}
            className="flex items-center gap-1.5 text-[12.5px] text-ink-3 transition-colors hover:text-ember-2"
          >
            <IdCard className="size-3.5" />
            DNI {client.dni}
          </button>
        ) : (
          <span className="text-[12.5px] text-faint">—</span>
        )}
      </td>

      {/* Recibido */}
      <td className="hidden whitespace-nowrap px-4 py-3 text-[12.5px] text-muted-foreground sm:table-cell">
        {timeAgo(novedad.createdAt)}
      </td>

      {/* Acción */}
      <td className="px-4 py-3">
        <span className="flex items-center justify-end gap-1.5 text-[11.5px] text-muted-foreground">
          <span className="hidden lg:inline">{isSiniestro ? 'Gestionar' : 'Ver en Bandeja'}</span>
          <ChevronRight className="size-4 text-faint transition-colors group-hover:text-muted-foreground" />
        </span>
      </td>
    </tr>
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

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: 'todas', label: 'Todas', count: stats?.unreadTotal ?? 0 },
    { value: 'siniestro', label: 'Siniestros', count: stats?.unreadSiniestros ?? 0 },
    { value: 'handoff', label: 'Asesor', count: stats?.unreadHandoff ?? 0 },
  ]

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
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
      </header>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line-2 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary/60 p-1 lg:w-auto">
            {tabs.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors lg:px-4',
                  tab === t.value ? 'bg-card text-ink shadow-sm' : 'text-muted-foreground hover:text-ink',
                )}
              >
                {t.label}
                {t.count > 0 && <CountBadge n={t.count} />}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Buscar por DNI o nombre del cliente"
              className="h-9 pl-8.5 text-[13px]"
            />
          </div>
        </div>

        {/* Table */}
        {isError ? (
          <div className="px-4 py-16 text-center text-[13px] text-destructive">
            No se pudieron cargar las novedades.
          </div>
        ) : !isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <CheckCheck className="size-5" />
            </div>
            <p className="text-[13.5px] text-muted-foreground">
              {search ? 'No hay novedades para esa búsqueda.' : 'No hay novedades por ahora.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-line-2 bg-secondary/30">
                  <th className={TH}>Novedad</th>
                  <th className={TH}>Tipo</th>
                  <th className={cn(TH, 'hidden md:table-cell')}>Cliente</th>
                  <th className={cn(TH, 'hidden sm:table-cell')}>Recibido</th>
                  <th className={cn(TH, 'text-right')}>Acción</th>
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
                              <Skeleton className="h-3.5 w-48" />
                              <Skeleton className="h-3 w-64" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-16" />
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <Skeleton className="h-3.5 w-20" />
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <Skeleton className="h-3.5 w-16" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </td>
                      </tr>
                    ))
                  : items.map(n => (
                      <NovedadTableRow key={n.id} novedad={n} onOpen={handleOpen} onOpenClient={setSelectedClientId} />
                    ))}
              </tbody>
            </table>
          </div>
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
