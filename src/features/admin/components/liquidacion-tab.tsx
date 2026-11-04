'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Download, Loader2, Lock, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { ApiError } from '@/src/lib/api-client'
import { saveBlob } from '@/src/lib/download'
import type { SettlementAmounts, SettlementMonth, SettlementOrganization } from '@/src/types/api/billing'
import { useCloseMonth, useSettlement } from '../hooks/use-settlement'
import { monthLabel, settlementCsv, shareLabel } from '../lib/settlement-format'
import { HEAD, int, Kpi, MonthPicker, thisMonth, usd } from './billing-ui'
import { SettlementPrint } from './liquidacion-print'
import { SettlementSeriesCard } from './liquidacion-series'
import { PrintFrame } from './print-frame'

const longDay = (iso: string) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })

function MoneyCells({ amounts }: { amounts: SettlementAmounts }) {
  const signed = (n: number) => (n < 0 ? 'text-destructive' : 'text-ink-3')
  return (
    <>
      <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
        {int(amounts.consumedMessages)}
      </TableCell>
      <TableCell className="text-right text-[13px] font-semibold text-ink">{usd(amounts.billedUsd)}</TableCell>
      <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
        {usd(amounts.serviceCostUsd)}
      </TableCell>
      <TableCell className={`text-right text-[13px] ${signed(amounts.remainderUsd)}`}>
        {usd(amounts.remainderUsd)}
      </TableCell>
      <TableCell className={`hidden text-right text-[13px] lg:table-cell ${signed(amounts.ownerShareUsd)}`}>
        {usd(amounts.ownerShareUsd)}
      </TableCell>
      <TableCell className={`hidden pr-5 text-right text-[13px] lg:table-cell ${signed(amounts.partnerShareUsd)}`}>
        {usd(amounts.partnerShareUsd)}
      </TableCell>
    </>
  )
}

function OrganizationRows({ org }: { org: SettlementOrganization }) {
  const [open, setOpen] = useState(false)
  const Chevron = open ? ChevronDown : ChevronRight
  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen(!open)}>
        <TableCell className="whitespace-normal pl-3 text-[14px] font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <Chevron className="size-4 text-muted-foreground" />
            {org.name}
            {!org.isActive && (
              <Badge variant="outline" className="border-line-2 text-[10.5px] text-muted-foreground">
                Inactiva
              </Badge>
            )}
          </span>
        </TableCell>
        <TableCell className="hidden text-right text-[13px] text-ink-3 sm:table-cell">
          {int(org.numbers.length)}
        </TableCell>
        <MoneyCells amounts={org.totals} />
      </TableRow>
      {open &&
        org.numbers.map(n => (
          <TableRow key={n.id} className="bg-secondary/30">
            <TableCell className="whitespace-normal pl-10 text-[13px] text-ink">
              <span className="font-mono whitespace-nowrap">{n.number}</span>
              <div className="text-[11.5px] text-muted-foreground">
                {n.trial ? 'Prueba' : `${n.plan.name} · ${usd(n.plan.priceUsd)}`}
                {n.prorated && ' · prorrateado'}
                {n.firstMonth && ' · primer mes'}
                {n.templateMessages > 0 &&
                  ` · ${int(n.templateMessages)} ${n.templateMessages === 1 ? 'plantilla' : 'plantillas'}`}
              </div>
            </TableCell>
            <TableCell className="hidden text-right text-[12px] text-muted-foreground sm:table-cell">
              {n.responsibleCode ? n.responsibleCode.code : '—'}
            </TableCell>
            <MoneyCells amounts={n} />
          </TableRow>
        ))}
    </>
  )
}

/** Whether the month's figures are frozen, live, or a past month still computed with today's plans. */
function MonthStatus({ month }: { month: SettlementMonth }) {
  const close = useCloseMonth()
  if (month.live)
    return (
      <p className="text-[12.5px] text-muted-foreground">
        Mes en curso: se calcula en vivo con el plan de cada número y se cierra solo el 1 del mes que viene.
      </p>
    )
  if (month.closed)
    return (
      <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Lock className="size-3.5 shrink-0" />
        {month.backfilled
          ? `Cerrado el ${longDay(month.closedAt ?? '')}, después de terminar el mes: se calculó con los planes de ese día.`
          : `Cerrado el ${longDay(month.closedAt ?? '')}: las cifras quedaron fijas.`}
      </p>
    )
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
      <span>
        Este mes todavía no está cerrado: se calcula con el plan que hoy tiene cada número. Al cerrarlo, las cifras
        quedan fijas.
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={close.isPending}
        onClick={() =>
          close.mutate(month.period, {
            onSuccess: () => toast.success('Mes cerrado'),
            onError: error =>
              toast.error(error instanceof ApiError && error.status < 500 ? error.message : 'No se pudo cerrar el mes'),
          })
        }
        className="h-8 border-line-2 text-[12.5px]"
      >
        {close.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" />}
        Cerrar mes
      </Button>
    </div>
  )
}

/** "Liquidación" (owner): how each month's billing splits between the platform and its commercial partner. */
export function LiquidacionTab() {
  const [period, setPeriod] = useState(thisMonth)
  const { data, isLoading, isError } = useSettlement(period, period === thisMonth())
  const [printing, setPrinting] = useState(false)
  const totals = data?.totals
  const ownerShare = data ? 1 - data.terms.partnerShare : 0

  const exportCsv = () => {
    if (!data) return
    saveBlob(new Blob([settlementCsv(data)], { type: 'text/csv;charset=utf-8' }), `liquidacion-${data.period}.csv`)
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <MonthPicker id="settlement-period" value={period} onChange={setPeriod} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={exportCsv} disabled={!data} className="h-9">
            <Download className="size-4" />
            Exportar CSV
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setPrinting(true)}
            disabled={!data}
            className="h-9"
          >
            <Printer className="size-4" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        {data && <MonthStatus month={data} />}
        {data && (
          <p className="max-w-3xl text-[12.5px] text-muted-foreground">
            Por cada número: el costo de servicio es {usd(data.terms.costPerMessageUsd)} por mensaje consumido del plan;
            lo que queda de lo facturado se reparte {shareLabel(ownerShare)} para la plataforma y{' '}
            {shareLabel(data.terms.partnerShare)} para el socio comercial. Un número en prueba no factura, así que su
            costo sale del reparto.
          </p>
        )}
      </div>
      {isError && <p className="mb-4 text-[14px] text-destructive">No se pudo cargar la liquidación.</p>}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !totals || !data ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
        ) : (
          <>
            <Kpi
              label="Facturado"
              value={usd(totals.billedUsd)}
              hint={`${int(totals.numbers)} ${totals.numbers === 1 ? 'número' : 'números'}${totals.trialNumbers > 0 ? ` · ${int(totals.trialNumbers)} en prueba` : ''}`}
            />
            <Kpi
              label="Costo de servicio"
              value={usd(totals.serviceCostUsd)}
              hint={`${int(totals.consumedMessages)} mensajes consumidos`}
            />
            <Kpi
              label="Remanente"
              value={usd(totals.remainderUsd)}
              hint="Facturado menos el costo"
              tone={totals.remainderUsd < 0 ? 'bad' : undefined}
            />
            <Kpi
              label="Parte plataforma"
              value={usd(totals.ownerShareUsd)}
              hint={`${shareLabel(ownerShare)} del remanente`}
              tone={totals.ownerShareUsd < 0 ? 'bad' : undefined}
            />
            <Kpi
              label="Socio comercial"
              value={usd(totals.partnerShareUsd)}
              hint={`${shareLabel(data.terms.partnerShare)} del remanente`}
              tone={totals.partnerShareUsd < 0 ? 'bad' : undefined}
            />
            <Kpi
              label="Total plataforma"
              value={usd(totals.ownerTotalUsd)}
              hint="Costo de servicio más su parte"
              tone="good"
            />
          </>
        )}
      </div>

      <Card className="overflow-hidden border-line-2 py-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-line-2 hover:bg-transparent">
              <TableHead className={`h-11 pl-5 ${HEAD}`}>Organización</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Números</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Mensajes</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Facturado</TableHead>
              <TableHead className={`hidden text-right sm:table-cell ${HEAD}`}>Costo</TableHead>
              <TableHead className={`text-right ${HEAD}`}>Remanente</TableHead>
              <TableHead className={`hidden text-right lg:table-cell ${HEAD}`}>Plataforma</TableHead>
              <TableHead className={`hidden pr-5 text-right lg:table-cell ${HEAD}`}>Socio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="pl-5">
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            )}
            {data?.organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-[14px] text-muted-foreground">
                  Ningún número facturó ni consumió mensajes en {monthLabel(data.period)}.
                </TableCell>
              </TableRow>
            )}
            {data?.organizations.map(org => (
              <OrganizationRows key={org.id} org={org} />
            ))}
          </TableBody>
        </Table>
      </Card>

      <SettlementSeriesCard />

      {printing && data && (
        <PrintFrame flow onDone={() => setPrinting(false)}>
          <SettlementPrint month={data} />
        </PrintFrame>
      )}
    </>
  )
}
