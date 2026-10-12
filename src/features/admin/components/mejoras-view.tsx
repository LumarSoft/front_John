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
import { ImprovementCard } from './improvement-card'

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
  const { data: improvements, isLoading, isError } = useImprovements()
  const { previousVisitAt } = useImprovementsVisit()
  const [area, setArea] = useState<ImprovementArea | ''>('')

  const all = improvements ?? []
  const areas = IMPROVEMENT_AREAS.filter(a => all.some(i => i.area === a))
  const visible = area ? all.filter(i => i.area === area) : all
  const newCount = all.filter(i => isNewSince(i, previousVisitAt)).length

  return (
    <div>
      <p className="mb-5 text-[13px] text-muted-foreground">
        Lo que fuimos cambiando en el bot y en el panel.
        {newCount > 0 && ` ${newCount === 1 ? 'Hay 1 nueva' : `Hay ${newCount} nuevas`} desde tu última visita.`}
      </p>

      {areas.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { key: '' as const, label: 'Todas', count: all.length },
            ...areas.map(a => ({
              key: a,
              label: IMPROVEMENT_AREA_LABEL[a],
              count: all.filter(i => i.area === a).length,
            })),
          ].map(chip => (
            <button
              key={chip.key || 'all'}
              type="button"
              onClick={() => setArea(chip.key)}
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

      {!isLoading && !isError && all.length === 0 && (
        <p className="rounded-xl border border-line-2 bg-card p-6 text-center text-[13.5px] text-muted-foreground">
          Todavía no hay mejoras publicadas. Cuando hagamos cambios los vas a ver acá.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {groupByMonth(visible).map(group => (
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
    </div>
  )
}
