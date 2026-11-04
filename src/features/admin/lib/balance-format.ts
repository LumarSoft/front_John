import type { BalanceMetricKey, BalanceMetricValue, BalanceMonth } from '@/src/types/api/balance'

/** Which way is good news: more policies is, more debt is not; more chats is neither. */
export type BalanceTrend = 'up' | 'down' | 'neutral'

export interface BalanceMetricInfo {
  key: BalanceMetricKey
  label: string
  hint?: string
  money?: boolean
  better: BalanceTrend
  /** A breakdown of the line above it. */
  sub?: boolean
}

export interface BalanceSection {
  title: string
  metrics: BalanceMetricInfo[]
}

export const BALANCE_SECTIONS: BalanceSection[] = [
  {
    title: 'Cartera',
    metrics: [
      { key: 'policiesInForce', label: 'Pólizas vigentes', hint: 'Al cierre del mes', better: 'up' },
      { key: 'policiesNew', label: 'Pólizas nuevas', hint: 'Empezaron en el mes', better: 'up' },
      {
        key: 'policiesLost',
        label: 'Vencidas sin renovar',
        hint: 'Terminaron en el mes y no se renovaron',
        better: 'down',
      },
      { key: 'premiumInForce', label: 'Prima vigente', hint: 'De las pólizas vigentes', money: true, better: 'up' },
    ],
  },
  {
    title: 'Cobranzas',
    metrics: [
      {
        key: 'debtAmount',
        label: 'Deuda por cobrar',
        hint: 'Cuotas pendientes, vencidas y rechazadas al cierre',
        money: true,
        better: 'down',
      },
      { key: 'installmentsOverdue', label: 'Cuotas vencidas', hint: 'Al cierre del mes', better: 'down' },
      { key: 'installmentsRejected', label: 'Cuotas rechazadas', hint: 'Al cierre del mes', better: 'down' },
    ],
  },
  {
    title: 'Siniestros',
    metrics: [
      {
        key: 'claimsFiled',
        label: 'Denuncias recibidas',
        hint: 'Por WhatsApp, el portal o el panel',
        better: 'neutral',
      },
      { key: 'claimsOpen', label: 'Siniestros abiertos', hint: 'Pendientes o en proceso al cierre', better: 'down' },
      {
        key: 'claimsBlocked',
        label: 'Denuncias frenadas',
        hint: 'El bot no las tomó y las pasó a la oficina',
        better: 'down',
      },
      { key: 'claimsBlockedNoPolicy', label: 'Sin póliza vigente', better: 'down', sub: true },
      { key: 'claimsBlockedRejectedPayment', label: 'Con pago rechazado', better: 'down', sub: true },
      { key: 'claimsBlockedOverdue', label: 'Con cuotas vencidas', better: 'down', sub: true },
    ],
  },
  {
    title: 'Ventas',
    metrics: [
      { key: 'quotes', label: 'Cotizaciones', better: 'up' },
      { key: 'quotesBot', label: 'Por WhatsApp', better: 'up', sub: true },
      { key: 'quotesWeb', label: 'Por la web o el panel', better: 'up', sub: true },
      { key: 'quoteRequests', label: 'Pedidos de cobertura', hint: 'Pidieron contratar lo cotizado', better: 'up' },
      {
        key: 'contactLeads',
        label: 'Consultas de otros seguros',
        hint: 'Pidieron que los llame un asesor',
        better: 'up',
      },
      {
        key: 'requestsClosed',
        label: 'Solicitudes cerradas',
        hint: 'De las del mes, cerradas al cierre',
        better: 'up',
      },
    ],
  },
  {
    title: 'Atención',
    metrics: [
      { key: 'handoffs', label: 'Pedidos de un asesor', better: 'neutral' },
      { key: 'conversationsNew', label: 'Chats nuevos', better: 'neutral' },
      { key: 'messagesSent', label: 'Mensajes enviados', hint: 'Por el bot y la oficina', better: 'neutral' },
      { key: 'rejectionNoticesSent', label: 'Avisos de pago rechazado', better: 'neutral' },
      { key: 'expiryNoticesSent', label: 'Avisos de póliza vencida', better: 'neutral' },
    ],
  },
]

export const BALANCE_METRIC_INFO: BalanceMetricInfo[] = BALANCE_SECTIONS.flatMap(section => section.metrics)

/** What a month rebuilt after the fact could not know. */
export const BACKFILL_NOTE =
  'Armado después con lo que quedó registrado: la deuda, las cuotas, los siniestros abiertos, las solicitudes cerradas y la prima vigente de ese cierre no se pueden saber.'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** "2026-10" → "Oct 2026" */
export function periodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return `${MONTHS[month - 1]} ${year}`
}

/** "2026-10" → "Oct" (charts) */
export function shortPeriodLabel(period: string): string {
  return MONTHS[Number(period.split('-')[1]) - 1]
}

const number = new Intl.NumberFormat('es-AR')
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export function formatBalanceValue(info: BalanceMetricInfo, value: number | null): string {
  if (value == null) return 'sin dato'
  return info.money ? money.format(value) : number.format(value)
}

export type ChangeTone = 'good' | 'bad' | 'neutral'

/** How a change reads: the arrow, its words and whether it is good news. */
export function describeChange(
  info: BalanceMetricInfo,
  metric: BalanceMetricValue,
): { direction: 'up' | 'down' | 'same'; text: string; tone: ChangeTone } | null {
  if (metric.change == null) return null
  if (metric.change === 0) return { direction: 'same', text: 'igual', tone: 'neutral' }
  const direction = metric.change > 0 ? 'up' : 'down'
  const sign = metric.change > 0 ? '+' : '−'
  const text =
    metric.changePct != null
      ? `${sign}${number.format(Math.abs(metric.changePct))} %`
      : `${sign}${info.money ? money.format(Math.abs(metric.change)) : number.format(Math.abs(metric.change))}`
  const tone: ChangeTone = info.better === 'neutral' ? 'neutral' : info.better === direction ? 'good' : 'bad'
  return { direction, text, tone }
}

const csvCell = (value: string) => (/[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

/**
 * The balance as a spreadsheet: one row per month, one column per metric.
 * Semicolons and decimal commas so Excel in Spanish opens it as numbers; a
 * month or metric without data says "sin dato".
 */
export function balanceCsv(months: BalanceMonth[]): string {
  const header = ['Mes', 'Reconstruido', ...BALANCE_METRIC_INFO.map(info => info.label)]
  const rows = months.map(month => [
    month.period,
    month.recorded ? (month.backfilled ? 'sí' : 'no') : 'sin balance',
    ...BALANCE_METRIC_INFO.map(info => {
      const value = month.metrics[info.key]?.value
      if (value == null) return 'sin dato'
      return info.money ? value.toFixed(2).replace('.', ',') : String(value)
    }),
  ])
  return [header, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n')
}

/** The CSV as a file; the byte order mark makes Excel read the accents right. */
export function balanceCsvBlob(months: BalanceMonth[]): Blob {
  return new Blob([String.fromCharCode(0xfeff), balanceCsv(months)], { type: 'text/csv;charset=utf-8' })
}
