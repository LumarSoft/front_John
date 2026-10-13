'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { cn } from '@/src/lib/utils'

interface ListPaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  /** What is being counted: [singular, plural], e.g. ['mejora', 'mejoras']. */
  noun: [string, string]
  onPageChange: (page: number) => void
  disabled?: boolean
  className?: string
}

/** "Mostrando 1–10 de 29" plus Anterior / Siguiente, as in the Siniestros and Asegurados lists. */
export function ListPagination({
  page,
  pageSize,
  total,
  totalPages,
  noun,
  onPageChange,
  disabled,
  className,
}: ListPaginationProps) {
  if (total === 0) return null
  const rangeStart = (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-[12px] text-muted-foreground">
        Mostrando{' '}
        <span className="font-medium text-ink-3">
          {rangeStart}–{rangeEnd}
        </span>{' '}
        de <span className="font-medium text-ink-3">{total}</span> {total === 1 ? noun[0] : noun[1]}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
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
            disabled={disabled || page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="h-8 border-line-2 px-2.5 text-[12.5px]"
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
