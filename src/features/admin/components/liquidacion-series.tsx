'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { ApiError } from '@/src/lib/api-client'
import type { SettlementSeriesMonth } from '@/src/types/api/billing'
import { useCloseMonth, useSettlementSeries } from '../hooks/use-settlement'
import { capitalized, monthLabel } from '../lib/settlement-format'
import { HEAD, int, usd } from './billing-ui'

// Recharts is heavy and below the fold — load it lazily.
const SettlementChart = dynamic(() => import('./settlement-chart').then(m => m.SettlementChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[260px] rounded-xl" />,
})

/** A past month with activity that nobody closed yet (before the monthly close existed, or the API was down). */
const isPending = (m: SettlementSeriesMonth) => !m.closed && !m.live && (m.billedUsd !== 0 || m.activeNumbers > 0)

function money(n: number) {
  return <span className={n < 0 ? 'text-destructive' : undefined}>{usd(n)}</span>
}

/** The last twelve months: the chart of how each one split, and the table with the numbers that came and went. */
export function SettlementSeriesCard() {
  const { data, isLoading, isError } = useSettlementSeries()
  const close = useCloseMonth()
  const [closingAll, setClosingAll] = useState(false)
  const months = data?.months ?? []
  const pending = months.filter(isPending)

  const closePending = async () => {
    setClosingAll(true)
    let closed = 0
    try {
      for (const month of pending) {
        await close.mutateAsync(month.period)
        closed++
      }
      toast.success(closed === 1 ? 'Se cerró 1 mes' : `Se cerraron ${closed} meses`)
    } catch (error) {
      toast.error(error instanceof ApiError && error.status < 500 ? error.message : 'No se pudieron cerrar los meses')
    } finally {
      setClosingAll(false)
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[20px] tracking-[-0.02em] text-ink">Últimos 12 meses</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
            Cómo se repartió lo facturado cada mes. Activos: números en servicio ese mes; nuevos: su primer mes; bajas:
            estaban en servicio el mes anterior y ese mes no.
          </p>
        </div>
        {pending.length > 0 && (
          <Button type="button" size="sm" onClick={closePending} disabled={closingAll} className="h-9 text-[12.5px]">
            {closingAll ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            Cerrar {pending.length === 1 ? 'el mes pendiente' : `los ${pending.length} meses pendientes`}
          </Button>
        )}
      </div>

      {isError && <p className="mb-4 text-[14px] text-destructive">No se pudo cargar la serie.</p>}

      <Card className="mb-4 border-line-2 p-4 shadow-sm">
        {isLoading || !data ? <Skeleton className="h-[260px] rounded-xl" /> : <SettlementChart months={months} />}
      </Card>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-11 pl-5 ${HEAD}`}>Mes</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Facturado</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Costo</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Remanente</TableHead>
              <TableHead className={`hidden text-right xl:table-cell ${HEAD}`}>Plataforma</TableHead>
              <TableHead className={`hidden text-right xl:table-cell ${HEAD}`}>Socio</TableHead>
              <TableHead className={`whitespace-normal text-right ${HEAD}`}>Total plataforma</TableHead>
              <TableHead className={`hidden text-right md:table-cell ${HEAD}`}>Activos</TableHead>
              <TableHead className={`hidden text-right md:table-cell ${HEAD}`}>Nuevos</TableHead>
              <TableHead className={`hidden pr-5 text-right md:table-cell ${HEAD}`}>Bajas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="pl-5">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            )}
            {[...months].reverse().map(m => (
              <TableRow key={m.period}>
                <TableCell className="whitespace-normal pl-5 text-[13px] text-ink">
                  {capitalized(monthLabel(m.period))}
                  <div className="text-[11.5px] text-muted-foreground">
                    {m.live ? 'en curso' : m.closed ? (m.backfilled ? 'cerrado después' : 'cerrado') : 'sin cerrar'}
                  </div>
                </TableCell>
                <TableCell className="text-right text-[13px] font-semibold text-ink">{usd(m.billedUsd)}</TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
                  {usd(m.serviceCostUsd)}
                </TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
                  {money(m.remainderUsd)}
                </TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 xl:table-cell">
                  {money(m.ownerShareUsd)}
                </TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 xl:table-cell">
                  {money(m.partnerShareUsd)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-semibold text-ink">{usd(m.ownerTotalUsd)}</TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 md:table-cell">
                  {int(m.activeNumbers)}
                </TableCell>
                <TableCell className="hidden text-right text-[13px] text-ink-3 md:table-cell">
                  {int(m.newNumbers)}
                </TableCell>
                <TableCell className="hidden pr-5 text-right text-[13px] text-ink-3 md:table-cell">
                  {int(m.stoppedNumbers)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}
