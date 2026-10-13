'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Button } from '@/src/components/ui/button'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import type { OwnerImprovement, OwnerImprovementFilter } from '@/src/types/api/improvements'
import { useOwnerImprovementActions, useOwnerImprovements } from '../hooks/use-improvements'
import { useListPage } from '../hooks/use-list-page'
import { ImprovementCard } from './improvement-card'
import { ImprovementFormDialog } from './improvement-form-dialog'
import { ListPagination } from './list-pagination'

const PAGE_SIZE = 10

const FILTERS: { key: OwnerImprovementFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'drafts', label: 'Borradores' },
  { key: 'published', label: 'Publicadas' },
]

/** Lumar (OWNER) writes, previews and publishes the improvements the organizations read. */
export function MejorasEditorView() {
  const [filter, setFilter] = useState<OwnerImprovementFilter>('all')
  const { page, goTo, reset, keepWithin, topRef } = useListPage()
  const { data: result, isLoading, isError, isFetching } = useOwnerImprovements({ page, pageSize: PAGE_SIZE, filter })
  keepWithin(result?.totalPages)
  const { update, remove } = useOwnerImprovementActions()
  const [editing, setEditing] = useState<OwnerImprovement | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<OwnerImprovement | null>(null)

  const visible = result?.data ?? []
  const drafts = result?.counts.drafts ?? 0

  const chooseFilter = (next: OwnerImprovementFilter) => {
    setFilter(next)
    reset()
  }

  const openForm = (improvement: OwnerImprovement | null) => {
    setEditing(improvement)
    setFormOpen(true)
  }

  const setPublished = (improvement: OwnerImprovement, published: boolean) =>
    update.mutate(
      { id: improvement.id, data: { published } },
      {
        onSuccess: () => toast.success(published ? 'Mejora publicada' : 'Pasó a borrador'),
        onError: () => toast.error('No se pudo actualizar la mejora'),
      },
    )

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('Mejora eliminada')
        setDeleting(null)
      },
      onError: () => toast.error('No se pudo eliminar la mejora'),
    })
  }

  return (
    <div ref={topRef} className="scroll-mt-20">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-xl text-[13px] text-muted-foreground">
          Lo que publiques acá lo ven los usuarios de la organización en su panel, con un aviso de nuevas.
          {drafts > 0 && ` Tenés ${drafts === 1 ? '1 borrador' : `${drafts} borradores`} sin publicar.`}
        </p>
        <Button onClick={() => openForm(null)}>
          <Plus className="size-4" /> Nueva mejora
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => chooseFilter(f.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
              filter === f.key
                ? 'border-ember bg-ember-soft text-ember-2'
                : 'border-line-2 bg-card text-ink-3 hover:border-ember/50',
            )}
          >
            {f.label} <span className="tabular-nums text-faint">{result?.counts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}
      {isError && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No se pudieron cargar las mejoras.
        </p>
      )}
      {!isLoading && !isError && visible.length === 0 && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No hay mejoras en esta lista.
        </p>
      )}

      <div className={cn('flex flex-col gap-4 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
        {visible.map(improvement => {
          const published = !!improvement.publishedAt
          const busy = update.isPending && update.variables?.id === improvement.id
          return (
            <ImprovementCard
              key={improvement.id}
              improvement={improvement}
              meta={
                <>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      published ? 'bg-paper-2 text-ink-3' : 'border border-dashed border-line-strong text-faint',
                    )}
                  >
                    {published ? 'Publicada' : 'Borrador'}
                  </span>
                  <span className="text-faint">· {improvement.producer?.name ?? 'Todas las organizaciones'}</span>
                </>
              }
              actions={
                <>
                  <Button variant="outline" size="sm" onClick={() => openForm(improvement)}>
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant={published ? 'outline' : 'default'}
                    size="sm"
                    disabled={busy}
                    onClick={() => setPublished(improvement, !published)}
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : published ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {published ? 'Pasar a borrador' : 'Publicar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive"
                    onClick={() => setDeleting(improvement)}
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </Button>
                </>
              }
            />
          )
        })}
      </div>

      {result && (
        <ListPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          totalPages={result.totalPages}
          noun={['mejora', 'mejoras']}
          onPageChange={goTo}
          disabled={isFetching}
          className="mt-6"
        />
      )}

      <ImprovementFormDialog improvement={editing} open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog
        open={!!deleting}
        onOpenChange={open => {
          if (!open && !remove.isPending) setDeleting(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta mejora?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.title}» deja de verse en el panel de la organización. Si solo querés ocultarla un tiempo,
              pasala a borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" disabled={remove.isPending} onClick={confirmDelete}>
              {remove.isPending && <Loader2 className="size-4 animate-spin" />} Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
