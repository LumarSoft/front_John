'use client'

import { useState } from 'react'
import { Skeleton } from '@/src/components/ui/skeleton'
import { cn } from '@/src/lib/utils'
import {
  IMPROVEMENT_AREAS,
  IMPROVEMENT_AREA_LABEL,
  type Improvement,
  type ImprovementArea,
} from '@/src/types/api/improvements'
import { useImprovements } from '../hooks/use-improvements'
import { useImprovementsVisit } from '../hooks/use-improvements-visit'
import { useListPage } from '../hooks/use-list-page'
import { ImprovementCard } from './improvement-card'
import { ListPagination } from './list-pagination'

const PAGE_SIZE = 10

const MONTH_FORMAT = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

function monthOf(improvement: Improvement): string {
  const iso = improvement.releasedOn ?? improvement.publishedAt ?? ''
  const label = iso ? MONTH_FORMAT.format(new Date(iso)) : ''
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Consecutive improvements of the same month, in the order the API sorted them (newest first). */
function groupByMonth(improvements: Improvement[]): { month: string; items: Improvement[] }[] {
  const groups: { month: string; items: Improvement[] }[] = []
  for (const improvement of improvements) {
    const month = monthOf(improvement)
    const last = groups.at(-1)
    if (last?.month === month) last.items.push(improvement)
    else groups.push({ month, items: [improvement] })
  }
  return groups
}

function isNewSince(improvement: Improvement, previousVisitAt: string | null | undefined): boolean {
  if (previousVisitAt === undefined || !improvement.publishedAt) return false
  return previousVisitAt === null || improvement.publishedAt > previousVisitAt
}

export function MejorasView() {
  const [area, setArea] = useState<ImprovementArea | ''>('')
  const { page, goTo, reset, keepWithin, topRef } = useListPage()
  const {
    data: result,
    isLoading,
    isError,
    isFetching,
  } = useImprovements({ page, pageSize: PAGE_SIZE, area: area || undefined })
  const { previousVisitAt, newCount } = useImprovementsVisit()
  keepWithin(result?.totalPages)

  const improvements = result?.data ?? []
  const areaCounts = result?.areaCounts
  const totalPublished = areaCounts ? Object.values(areaCounts).reduce((sum, n) => sum + n, 0) : 0
  const areas = IMPROVEMENT_AREAS.filter(a => (areaCounts?.[a] ?? 0) > 0)

  const chooseArea = (next: ImprovementArea | '') => {
    setArea(next)
    reset()
  }

  return (
    <div ref={topRef} className="scroll-mt-20">
      <p className="mb-5 text-[13px] text-muted-foreground">
        Lo que fuimos cambiando en el bot y en el panel.
        {newCount > 0 && ` ${newCount === 1 ? 'Hay 1 nueva' : `Hay ${newCount} nuevas`} desde tu última visita.`}
      </p>

      {areas.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { key: '' as const, label: 'Todas', count: totalPublished },
            ...areas.map(a => ({ key: a, label: IMPROVEMENT_AREA_LABEL[a], count: areaCounts?.[a] ?? 0 })),
          ].map(chip => (
            <button
              key={chip.key || 'all'}
              type="button"
              onClick={() => chooseArea(chip.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                area === chip.key
                  ? 'border-ember bg-ember-soft text-ember-2'
                  : 'border-line-2 bg-card text-ink-3 hover:border-ember/50',
              )}
            >
              {chip.label} <span className="tabular-nums text-faint">{chip.count}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          No se pudieron cargar las mejoras. Probá de nuevo en un rato.
        </p>
      )}

      {!isLoading && !isError && totalPublished === 0 && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          Todavía no hay mejoras publicadas. Cuando hagamos cambios los vas a ver acá.
        </p>
      )}

      <div className={cn('flex flex-col gap-8 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
        {groupByMonth(improvements).map(group => (
          <section key={group.month} className="flex flex-col gap-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{group.month}</h2>
            {group.items.map(improvement => (
              <ImprovementCard
                key={improvement.id}
                improvement={improvement}
                isNew={isNewSince(improvement, previousVisitAt)}
              />
            ))}
          </section>
        ))}
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
    </div>
  )
}
