import { useState } from 'react'
import { BadgeDollarSign, MessageCircleReply, Send, Trophy, UserCheck, Wallet, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Skeleton } from '@/src/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import type { Campaign, CampaignResultCounts, CampaignResultsResponse } from '@/src/types/api/campaigns'
import { useCampaignResults } from '../hooks/use-campaigns'
import { useScopeFilterState } from '../hooks/use-scope-filter-state'
import { useTaskPeople } from '../hooks/use-tasks'
import { formatPremium, formatRate } from '../lib/campaigns-format'
import { ScopeFilter, type ScopeFilterValue } from './scope-filter'

const SELECT = 'h-9 w-full min-w-0 rounded-md border border-line-2 bg-background px-2.5 text-[12.5px] text-ink-3'
const HEAD = 'text-[11px] uppercase tracking-[0.12em] text-faint'

type Period = '30' | '90' | 'month' | 'year' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  '30': 'Últimos 30 días',
  '90': 'Últimos 90 días',
  month: 'Este mes',
  year: 'Este año',
  all: 'Desde el principio',
}

/** The day, as the API reads it (YYYY-MM-DD, Argentina). */
const day = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })

/** The period's first day; the end is always today. */
function periodFrom(period: Period, now = new Date()): string | undefined {
  switch (period) {
    case '30':
      return day(new Date(now.getTime() - 30 * 86_400_000))
    case '90':
      return day(new Date(now.getTime() - 90 * 86_400_000))
    case 'month':
      return day(now).slice(0, 8) + '01'
    case 'year':
      return day(now).slice(0, 5) + '01-01'
    case 'all':
      return '2026-01-01'
  }
}

interface Kpi {
  key: string
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: string
}

function buildKpis(totals: CampaignResultsResponse['totals']): Kpi[] {
  const contacted = totals.contacted
  return [
    {
      key: 'sent',
      label: 'Enviados',
      value: String(totals.sent),
      hint: totals.marked ? `+ ${totals.marked} contactados por otra vía` : 'mensajes de WhatsApp',
      icon: Send,
      tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    },
    {
      key: 'replied',
      label: 'Respondieron',
      value: String(totals.replied),
      hint: `${formatRate(totals.replied, contacted)} de los contactados`,
      icon: MessageCircleReply,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    },
    {
      key: 'quoted',
      label: 'Cotizaciones',
      value: String(totals.quoted),
      hint: `${formatRate(totals.quoted, contacted)} de los contactados`,
      icon: BadgeDollarSign,
      tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
    },
    {
      key: 'won',
      label: 'Ventas',
      value: String(totals.won),
      hint: `${formatRate(totals.won, contacted)} de los contactados`,
      icon: Trophy,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      key: 'lost',
      label: 'Perdidas',
      value: String(totals.lost),
      hint: totals.open ? `${totals.open} todavía abiertas` : 'ninguna abierta',
      icon: XCircle,
      tone: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    },
    {
      key: 'premium',
      label: 'Prima generada',
      value: formatPremium(totals.premium),
      hint: 'de las pólizas vendidas',
      icon: Wallet,
      tone: 'bg-ember-soft text-ember-2',
    },
  ]
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  return (
    <Card className="border-line-2 p-4 shadow-sm">
      <span className={`flex size-10 items-center justify-center rounded-xl ${kpi.tone}`}>
        <Icon className="size-5" />
      </span>
      <CardContent className="mt-3 p-0">
        <div className="font-display text-[26px] leading-none text-ink">{kpi.value}</div>
        <div className="mt-1.5 text-[13px] font-medium text-ink">{kpi.label}</div>
        <div className="text-[12px] text-muted-foreground">{kpi.hint}</div>
      </CardContent>
    </Card>
  )
}

function CountCells({ counts }: { counts: CampaignResultCounts }) {
  return (
    <>
      <TableCell className="text-right tabular-nums">{counts.contacted}</TableCell>
      <TableCell className="text-right tabular-nums">
        {counts.replied}
        <span className="ml-1 text-[11px] text-muted-foreground">{formatRate(counts.replied, counts.contacted)}</span>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {counts.quoted}
        <span className="ml-1 text-[11px] text-muted-foreground">{formatRate(counts.quoted, counts.contacted)}</span>
      </TableCell>
      <TableCell className="text-right tabular-nums text-emerald-700 dark:text-emerald-400">
        {counts.won}
        <span className="ml-1 text-[11px] text-muted-foreground">{formatRate(counts.won, counts.contacted)}</span>
      </TableCell>
      <TableCell className="text-right tabular-nums">{counts.lost}</TableCell>
      <TableCell className="text-right tabular-nums">{counts.open}</TableCell>
      <TableCell className="pr-5 text-right tabular-nums">{formatPremium(counts.premium)}</TableCell>
    </>
  )
}

function CountHeads() {
  return (
    <>
      <TableHead className={`text-right ${HEAD}`}>Contactados</TableHead>
      <TableHead className={`text-right ${HEAD}`}>Respondieron</TableHead>
      <TableHead className={`text-right ${HEAD}`}>Cotizaciones</TableHead>
      <TableHead className={`text-right ${HEAD}`}>Ventas</TableHead>
      <TableHead className={`text-right ${HEAD}`}>Perdidas</TableHead>
      <TableHead className={`text-right ${HEAD}`}>Abiertas</TableHead>
      <TableHead className={`pr-5 text-right ${HEAD}`}>Prima</TableHead>
    </>
  )
}

/** "Resultados": what the campaign produced in a period, in total and by the person who followed each client. */
export function CampaignResultsTab({ campaign }: { campaign: Campaign }) {
  const [period, setPeriod] = useState<Period>('90')
  const [scope, setScope] = useScopeFilterState()
  const [assignedToId, setAssignedToId] = useState('')
  const { data: people = [] } = useTaskPeople()
  const { data, isLoading, isError, isFetching } = useCampaignResults(
    {
      kind: campaign.kind,
      from: periodFrom(period),
      ...scope,
      assignedToId: assignedToId ? Number(assignedToId) : undefined,
    },
    campaign.plan.included,
  )
  const changeScope = (value: ScopeFilterValue) => setScope(value)

  if (!campaign.plan.included) {
    return (
      <div className="rounded-xl border border-line-2 bg-secondary/30 px-5 py-10 text-center text-[13.5px] text-muted-foreground">
        Tu plan no incluye esta campaña.
      </div>
    )
  }

  const row = data?.campaigns.find(c => c.kind === campaign.kind)
  const totals = data?.totals

  return (
    <div className={isFetching && !isLoading ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className={`${SELECT} sm:w-48`}
          aria-label="Período"
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map(value => (
            <option key={value} value={value}>
              {PERIOD_LABELS[value]}
            </option>
          ))}
        </select>
        <ScopeFilter value={scope} onChange={changeScope} className="sm:w-64" />
        <select
          value={assignedToId}
          onChange={e => setAssignedToId(e.target.value)}
          className={`${SELECT} sm:w-56`}
          aria-label="Asesor"
        >
          <option value="">Todo el equipo</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>
              {person.name ?? person.email}
            </option>
          ))}
        </select>
      </div>

      {isError && <p className="text-[14px] text-destructive">No se pudieron cargar los resultados.</p>}

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-xl" />
          ))}
        </div>
      )}

      {totals && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {buildKpis(totals).map(kpi => (
              <KpiCard key={kpi.key} kpi={kpi} />
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            Cada oportunidad cuenta en el período en que se contactó al cliente. Las respuestas, cotizaciones y ventas
            las detecta el sistema solo; las perdidas las marca la oficina.
          </p>

          <h3 className="mt-7 text-[13px] font-medium uppercase tracking-[0.12em] text-faint">Por asesor</h3>
          <Card className="mt-2 overflow-hidden border-line-2 py-0 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-line-2 hover:bg-transparent">
                  <TableHead className={`h-11 pl-5 ${HEAD}`}>Asesor</TableHead>
                  <CountHeads />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byAssignee.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-[13.5px] text-muted-foreground">
                      Todavía no hay oportunidades en este período.
                    </TableCell>
                  </TableRow>
                )}
                {data.byAssignee.map(person => (
                  <TableRow key={person.user?.id ?? 'none'}>
                    <TableCell className="pl-5 text-[13px] text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-muted-foreground" />
                        {person.user ? (person.user.name ?? 'Sin nombre') : 'Sin asignar'}
                      </span>
                    </TableCell>
                    <CountCells counts={person} />
                  </TableRow>
                ))}
                {row && data.byAssignee.length > 1 && (
                  <TableRow className="bg-secondary/40 font-medium">
                    <TableCell className="pl-5 text-[13px] text-ink">Total</TableCell>
                    <CountCells counts={row} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
