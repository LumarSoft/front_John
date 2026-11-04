import type { SettlementAmounts, SettlementMonth } from '@/src/types/api/billing'

/** "2026-10" → "octubre de 2026". */
export function monthLabel(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

/** "octubre de 2026" → "Octubre de 2026", to open a line. */
export function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "2026-10" → "oct 26", for the chart's axis. */
export function shortMonthLabel(period: string): string {
  const [year, month] = period.split('-').map(Number)
  const name = new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')
  return `${name} ${String(year).slice(2)}`
}

/** A share as a percentage: 0.4 → "40 %". */
export function shareLabel(share: number): string {
  return `${(share * 100).toLocaleString('es-AR', { maximumFractionDigits: 2 })} %`
}

/**
 * A cell of the CSV: decimal comma (as a spreadsheet in Spanish reads it) and quotes only when needed. Text that a
 * spreadsheet would take for a formula (=, +, -, @) starts with an apostrophe.
 */
function cell(value: string | number): string {
  if (typeof value === 'number') return String(value).replace('.', ',')
  const text = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const MONEY_COLUMNS: Array<[string, keyof SettlementAmounts]> = [
  ['Mensajes consumidos', 'consumedMessages'],
  ['Facturado USD', 'billedUsd'],
  ['Costo de servicio USD', 'serviceCostUsd'],
  ['Remanente USD', 'remainderUsd'],
  ['Parte plataforma USD', 'ownerShareUsd'],
  ['Parte socio comercial USD', 'partnerShareUsd'],
  ['Total plataforma USD', 'ownerTotalUsd'],
]

/**
 * The month as a CSV, one row per number plus a total per organization and for the month. Semicolon-separated with
 * a UTF-8 BOM, so a spreadsheet set to Spanish opens it in columns with its accents.
 */
export function settlementCsv(month: SettlementMonth): string {
  const header = ['Mes', 'Organización', 'Número', 'Plan', 'Prueba', 'Plantillas', ...MONEY_COLUMNS.map(([l]) => l)]
  const money = (amounts: SettlementAmounts) => MONEY_COLUMNS.map(([, key]) => amounts[key])
  const rows: Array<Array<string | number>> = [header]
  for (const org of month.organizations) {
    for (const n of org.numbers)
      // The number without its leading "+", which a spreadsheet would read as a formula.
      rows.push([
        month.period,
        org.name,
        n.number.replace(/^\+/, ''),
        n.plan.name,
        n.trial ? 'Sí' : 'No',
        n.templateMessages,
        ...money(n),
      ])
    rows.push([month.period, org.name, 'Total organización', '', '', '', ...money(org.totals)])
  }
  rows.push([month.period, 'Total del mes', '', '', '', '', ...money(month.totals)])
  return '\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n') + '\r\n'
}
