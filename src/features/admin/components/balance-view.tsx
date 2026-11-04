'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Download, Minus } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { saveBlob } from '@/src/lib/download'
import { cn } from '@/src/lib/utils'
import type { BalanceMetricKey, BalanceMonth } from '@/src/types/api/balance'
import { useBalance } from '../hooks/use-balance'
import { useScopeFilterState } from '../hooks/use-scope-filter-state'
import {
  BACKFILL_NOTE,
  BALANCE_METRIC_INFO,
  BALANCE_SECTIONS,
  balanceCsvBlob,
  describeChange,
  formatBalanceValue,
  periodLabel,
  type BalanceMetricInfo,
  type ChangeTone,
} from '../lib/balance-format'
import { ScopeFilter } from './scope-filter'

// Recharts is heavy and never needed on first paint — load it lazily.
const BalanceCharts = dynamic(() => import('./balance-charts').then(m => m.BalanceCharts), {
  ssr: false,
  loading: () => (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[340px] rounded-xl" />
      ))}
    </div>
  ),
})

const MONTH_OPTIONS = [6, 12, 24]
/** The last month's numbers shown on top. */
const HIGHLIGHTS: BalanceMetricKey[] = ['policiesInForce', 'policiesNew', 'quotes', 'claimsBlocked']

const TONE_CLASSES: Record<ChangeTone, string> = {
  good: 'text-emerald-700 dark:text-emerald-400',
  bad: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
}

const infoOf = (key: BalanceMetricKey) => BALANCE_METRIC_INFO.find(info => info.key === key) as BalanceMetricInfo

function Change({ info, month }: { info: BalanceMetricInfo; month: BalanceMonth }) {
  const change = describeChange(info, month.metrics[info.key])
  if (!change) return null
  const Icon = change.direction === 'up' ? ArrowUpRight : change.direction === 'down' ? ArrowDownRight : Minus
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-[11.5px] tabular-nums', TONE_CLASSES[change.tone])}
      title="Contra el mes anterior"
    >
      <Icon className="size-3.5" aria-hidden />
      {change.text}
    </span>
  )
}

function NoData() {
  return <span className="text-[12.5px] italic text-muted-foreground">sin dato</span>
}

function Highlights({ month }: { month: BalanceMonth }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {HIGHLIGHTS.map(key => {
        const info = infoOf(key)
        const value = month.metrics[key].value
        return (
          <Card key={key} className="border-line-2 p-4 shadow-sm">
            <CardContent className="p-0">
              <div className="text-[12px] text-muted-foreground">{info.label}</div>
              <div className="mt-1.5 font-display text-[28px] leading-none text-ink">
                {value == null ? <NoData /> : formatBalanceValue(info, value)}
              </div>
              <div className="mt-2 min-h-4">
                <Change info={info} month={month} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function MonthHeader({ month }: { month: BalanceMonth }) {
  return (
    <th scope="col" className="min-w-[124px] px-3 py-3 text-right align-bottom font-medium text-ink">
      <div className="text-[13px]">{periodLabel(month.period)}</div>
      {!month.recorded ? (
        <div className="text-[11px] font-normal text-muted-foreground">sin balance</div>
      ) : month.backfilled ? (
        <div className="text-[11px] font-normal text-amber-700 dark:text-amber" title={BACKFILL_NOTE}>
          reconstruido
        </div>
      ) : null}
    </th>
  )
}

function BalanceTable({ months }: { months: BalanceMonth[] }) {
  // Newest first: the month just closed is the one read most.
  const columns = [...months].reverse()
  return (
    <Card className="mt-5 overflow-hidden border-line-2 py-0 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line-2">
              <th scope="col" className="sticky left-0 z-10 min-w-[220px] bg-card px-4 py-3 text-left font-medium">
                <span className="sr-only">Métrica</span>
              </th>
              {columns.map(month => (
                <MonthHeader key={month.period} month={month} />
              ))}
            </tr>
          </thead>
          {BALANCE_SECTIONS.map(section => (
            <tbody key={section.title}>
              <tr className="bg-secondary/60">
                <th
                  scope="rowgroup"
                  colSpan={columns.length + 1}
                  className="sticky left-0 px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-ember-2"
                >
                  {section.title}
                </th>
              </tr>
              {section.metrics.map(info => (
                <tr key={info.key} className="border-b border-line last:border-b-0">
                  <th
                    scope="row"
                    className={cn('sticky left-0 z-10 bg-card px-4 py-2.5 text-left font-normal', info.sub && 'pl-8')}
                  >
                    <div className={cn('text-ink', info.sub ? 'text-[12.5px] text-ink-3' : 'font-medium')}>
                      {info.label}
                    </div>
                    {info.hint && <div className="text-[11.5px] text-muted-foreground">{info.hint}</div>}
                  </th>
                  {columns.map(month => {
                    const value = month.metrics[info.key].value
                    return (
                      <td key={month.period} className="px-3 py-2.5 text-right align-top">
                        {value == null ? (
                          <NoData />
                        ) : (
                          <div className="tabular-nums text-ink">{formatBalanceValue(info, value)}</div>
                        )}
                        <Change info={info} month={month} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </Card>
  )
}

export function BalanceView() {
  // Opens on the office line for a SuperAdmin; see useScopeFilterState.
  const [scope, setScope] = useScopeFilterState()
  const [months, setMonths] = useState(12)
  const { data, isLoading, isError, refetch } = useBalance({ months, ...scope })
  const recorded = data?.months.filter(month => month.recorded) ?? []
  const latest = recorded.at(-1)

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-ember-2">Balance mensual</div>
          <h1 className="mt-2 font-display text-[clamp(26px,3.5vw,36px)] tracking-[-0.035em] text-ink">
            Cómo viene cada mes
          </h1>
          <p className="mt-1.5 max-w-xl text-[14px] text-muted-foreground">
            El cierre de cada mes: cartera, cobranzas, siniestros, ventas y atención. Las flechas comparan con el mes
            anterior; verde es buena noticia y rojo es para mirar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScopeFilter value={scope} onChange={setScope} />
          <select
            value={months}
            onChange={e => setMonths(Number(e.target.value))}
            aria-label="Meses a mostrar"
            className="h-10 rounded-md border border-line-2 bg-background px-3 text-[13px] text-ink-3"
          >
            {MONTH_OPTIONS.map(n => (
              <option key={n} value={n}>
                Últimos {n} meses
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="h-10"
            disabled={!recorded.length}
            onClick={() => data && saveBlob(balanceCsvBlob(data.months), 'balance-mensual.csv')}
          >
            <Download className="size-4" />
            Descargar CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[112px] rounded-xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <Card className="mt-8 border-line-2 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-[20px] text-ink">No pudimos cargar el balance</h2>
              <p className="mx-auto mt-1.5 max-w-[380px] text-[13.5px] text-muted-foreground">
                Revisá tu conexión e intentá de nuevo.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {data && !recorded.length ? (
        <Card className="mt-8 border-line-2 shadow-sm">
          <CardContent className="py-14 text-center">
            <h2 className="font-display text-[20px] text-ink">Todavía no hay balances</h2>
            <p className="mx-auto mt-1.5 max-w-[420px] text-[13.5px] text-muted-foreground">
              El balance de cada mes se arma el día 1 del mes siguiente. Cuando esté el primero lo vas a ver acá.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {data && latest ? (
        <>
          <p className="mt-8 text-[12.5px] text-muted-foreground">
            Último cierre: <span className="font-medium text-ink">{periodLabel(latest.period)}</span>
          </p>
          <Highlights month={latest} />
          <BalanceCharts months={data.months} />
          <BalanceTable months={data.months} />
          <p className="mt-3 text-[12px] text-muted-foreground">
            <span className="italic">sin dato</span>: ese mes no se registró. Los meses marcados{' '}
            <span className="text-amber-700 dark:text-amber">reconstruido</span> se armaron después con lo que quedó
            registrado: la deuda, las cuotas, los siniestros abiertos, las solicitudes cerradas y la prima vigente de
            ese cierre no se pueden saber.
          </p>
        </>
      ) : null}
    </div>
  )
}
