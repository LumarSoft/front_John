'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/src/components/ui/alert-dialog'
import { Input } from '@/src/components/ui/input'
import { cn } from '@/src/lib/utils'
import { useDebouncedValue } from '@/src/hooks/use-debounced-value'
import {
  MATTER_LABELS,
  MATTER_STATUS_LABELS,
  type MatterCategory,
  type MatterStatus,
  type NovedadItem,
} from '@/src/types/api/novedades'
import { novedadesService } from '@/src/services/novedades.service'
import { useAuth } from '../context/auth-context'
import { formatDate } from '../lib/asegurados-ui'
import { useNovedades } from '../hooks/use-novedades'
import { useNovedadesStats } from '../hooks/use-novedades-stats'
import { useNovedadesActions } from '../hooks/use-novedades-actions'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'
import { SiniestroSheet } from './siniestro-sheet'
import { AseguradoSheet } from './asegurado-sheet'
import { inboxConversationHref } from './inbox-view'

const categories = Object.keys(MATTER_LABELS) as MatterCategory[]
const selectClass = 'h-9 rounded-md border border-line-2 bg-card px-2 text-[12px] text-ink'

export function NovedadesView() {
  const [confirmClear, setConfirmClear] = useState(false)
  const router = useRouter()
  const { token } = useAuth()
  const visitStarted = useRef(false)
  const [previousVisit, setPreviousVisit] = useState<string | null>(null)
  const [sinceVisit, setSinceVisit] = useState(false)
  const [category, setCategory] = useState<MatterCategory | ''>('')
  const [status, setStatus] = useState<MatterStatus | 'actionable' | 'all'>('actionable')
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedSiniestroId, setSelectedSiniestroId] = useState<number | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 350)
  const [scope, setScope] = useState<ScopeFilterValue>({})
  const {
    data: page,
    isLoading,
    isError,
    isFetching,
  } = useNovedades({
    category: category || undefined,
    status: status === 'actionable' || status === 'all' ? undefined : status,
    actionable: status === 'actionable',
    since: sinceVisit ? (previousVisit ?? undefined) : undefined,
    search,
    ...scope,
    page: pageNumber,
    pageSize: 20,
  })
  const { data: stats } = useNovedadesStats(scope)
  const { markRead, updateMatter, clearAll } = useNovedadesActions()

  useEffect(() => {
    if (!token || visitStarted.current) return
    visitStarted.current = true
    void novedadesService
      .visit(token)
      .then(result => setPreviousVisit(result.previousVisitAt))
      .catch(() => {
        toast.error('No se pudo registrar la visita. Podés seguir viendo todos los asuntos.')
      })
  }, [token])

  const handleOpen = (matter: NovedadItem) => {
    if (!matter.readAt) markRead.mutate(matter.id, { onError: () => toast.error('No se pudo marcar como leído') })
    if (matter.type === 'siniestro') setSelectedSiniestroId(matter.refId)
    else if (matter.type === 'handoff' || matter.type === 'baja_poliza')
      router.push(inboxConversationHref(matter.refId))
    else router.push(`/admin/solicitudes?kind=${matter.type === 'lead' ? 'lead' : 'cotizacion'}&id=${matter.refId}`)
  }
  const changeMatter = (id: number, changes: { category?: MatterCategory; status?: MatterStatus }) => {
    updateMatter.mutate(
      { id, ...changes },
      {
        onError: () => toast.error('No se pudo actualizar el asunto'),
        onSuccess: () => {
          if (page?.data.length === 1 && pageNumber > 1) setPageNumber(n => n - 1)
        },
      },
    )
  }
  const resetPage = () => setPageNumber(1)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-[22px] tracking-tight text-ink">
            <Bell className="size-5 text-ember-2" />
            Asuntos pendientes
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Lo que necesita atención del equipo. Leer una conversación no resuelve el asunto.
          </p>
        </div>
        <Button variant="outline" className="text-destructive" onClick={() => setConfirmClear(true)}>
          <Trash2 className="size-4" /> Limpiar todas
        </Button>
      </header>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {categories.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setCategory(category === key ? '' : key)
              setStatus('actionable')
              resetPage()
            }}
            className={cn(
              'rounded-xl border bg-card p-4 text-left transition-colors hover:border-ember/50',
              category === key ? 'border-ember bg-ember-soft' : 'border-line-2',
            )}
          >
            <span className="block text-[12px] text-muted-foreground">{MATTER_LABELS[key]}</span>
            <span className="mt-2 block text-2xl font-semibold tabular-nums text-ink">
              {stats?.actionableByCategory[key] ?? '—'}
            </span>
            <span className="text-[11px] text-muted-foreground">por atender</span>
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-line-2 bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line-2 p-3">
          <select
            aria-label="Filtrar por asunto"
            className={selectClass}
            value={category}
            onChange={e => {
              setCategory(e.target.value as MatterCategory | '')
              resetPage()
            }}
          >
            <option value="">Todos los asuntos</option>
            {categories.map(key => (
              <option key={key} value={key}>
                {MATTER_LABELS[key]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por estado"
            className={selectClass}
            value={status}
            onChange={e => {
              setStatus(e.target.value as typeof status)
              resetPage()
            }}
          >
            <option value="actionable">Por atender</option>
            <option value="all">Todos los estados</option>
            {Object.entries(MATTER_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ScopeFilter
            value={scope}
            onChange={value => {
              setScope(value)
              resetPage()
            }}
            className="!h-9"
          />
          <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <input
              type="checkbox"
              checked={sinceVisit}
              disabled={!previousVisit}
              onChange={e => {
                setSinceVisit(e.target.checked)
                resetPage()
              }}
            />
            Desde mi última visita
          </label>
          <div className="relative sm:ml-auto sm:w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value)
                resetPage()
              }}
              placeholder="Buscar cliente, teléfono o motivo"
              className="h-9 pl-8.5 text-[13px]"
            />
          </div>
        </div>
        {isError ? (
          <p role="alert" className="p-10 text-center text-destructive">
            No se pudieron cargar los asuntos.
          </p>
        ) : isLoading ? (
          <p className="p-10 text-center text-muted-foreground">Cargando asuntos…</p>
        ) : !page?.data.length ? (
          <p className="p-10 text-center text-muted-foreground">No hay asuntos que coincidan con estos filtros.</p>
        ) : (
          <ul className="divide-y divide-line">
            {page.data.map(matter => (
              <li
                key={matter.id}
                className={cn('flex flex-wrap items-start gap-4 p-4', !matter.readAt && 'bg-ember-soft/25')}
              >
                <div className="min-w-0 flex-1 basis-64">
                  <button
                    type="button"
                    onClick={() => handleOpen(matter)}
                    className="text-left text-[14px] font-semibold text-ink hover:text-ember-2"
                  >
                    {!matter.readAt && (
                      <span className="mr-2 inline-block size-2 rounded-full bg-ember-2" aria-label="No leído" />
                    )}
                    {matter.title}
                  </button>
                  <p className="mt-1 line-clamp-3 max-w-2xl whitespace-pre-wrap break-words text-[13px] text-muted-foreground">
                    {matter.body || 'Pidió atención de un asesor. Revisar la conversación para precisar el motivo.'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      Recibido: {formatDate(matter.createdAt)} ·{' '}
                      {new Date(matter.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {matter.client && (
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(matter.client!.id)}
                        className="hover:text-ember-2"
                      >
                        DNI {matter.client.dni}
                      </button>
                    )}
                    {matter.status === 'resolved' && <span className="text-emerald-700">Resuelto</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Categoría de ${matter.title}`}
                    className={selectClass}
                    value={matter.category}
                    disabled={updateMatter.isPending}
                    onChange={e => changeMatter(matter.id, { category: e.target.value as MatterCategory })}
                  >
                    {categories.map(key => (
                      <option key={key} value={key}>
                        {MATTER_LABELS[key]}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={`Estado de ${matter.title}`}
                    className={selectClass}
                    value={matter.status}
                    disabled={updateMatter.isPending}
                    onChange={e => changeMatter(matter.id, { status: e.target.value as MatterStatus })}
                  >
                    {Object.entries(MATTER_STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" onClick={() => handleOpen(matter)}>
                    {matter.type === 'handoff' || matter.type === 'baja_poliza' ? 'Ver chat' : 'Ver detalle'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between border-t border-line-2 p-3 text-[12px] text-muted-foreground">
          <span>
            {page?.total ?? 0} asuntos · Página {page?.page ?? 1} de {page?.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pageNumber === 1 || isFetching}
              onClick={() => setPageNumber(n => n - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!page || pageNumber >= page.totalPages || isFetching}
              onClick={() => setPageNumber(n => n + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
      <AlertDialog
        open={confirmClear}
        onOpenChange={open => {
          if (!clearAll.isPending) setConfirmClear(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Limpiar todas las novedades?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitarán todas las novedades a las que tenés acceso, incluidas las de otras páginas, estados y filtros.
              Los chats, clientes, pólizas, siniestros y solicitudes se conservan, con sus estados actuales. Esta acción
              no se puede deshacer desde el panel. Las nuevas novedades seguirán apareciendo normalmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearAll.isPending}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={clearAll.isPending}
              onClick={() =>
                clearAll.mutate(undefined, {
                  onSuccess: result => {
                    setConfirmClear(false)
                    setPageNumber(1)
                    toast.success(`${result.clearedCount} novedades limpiadas`)
                  },
                  onError: () => toast.error('No se pudieron limpiar las novedades. Intentá nuevamente.'),
                })
              }
            >
              {clearAll.isPending && <Loader2 className="size-4 animate-spin" />}
              Sí, limpiar todas
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SiniestroSheet siniestroId={selectedSiniestroId} onClose={() => setSelectedSiniestroId(null)} />
      <AseguradoSheet clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  )
}
