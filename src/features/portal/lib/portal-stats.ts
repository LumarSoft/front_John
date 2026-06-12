import type { Cuota, PolizaListItem, RiskType } from '@/src/services/polizas.service'
import { effectiveRiskType, isBien, RISK_COLORS, RISK_LABELS } from './portal-ui'

const EXPIRING_WINDOW_DAYS = 30
const DAY_MS = 86_400_000

export interface RamoSlice {
  ramo: RiskType
  label: string
  value: number
  color: string
}

export interface VencimientoItem {
  poliza: PolizaListItem
  cuota: Cuota
}

export interface MonthlyDue {
  label: string // "ene", "feb"…
  total: number
}

export interface PortalStats {
  bienesCount: number
  polizasCount: number
  vigentes: number
  porVencer: number
  vencidas: number
  cuotasPendientes: number
  cuotasVencidas: number
  cuotasPagadas: number
  deudaTotal: number
  ramos: RamoSlice[]
  proximosVencimientos: VencimientoItem[]
  monthlyDue: MonthlyDue[]
}

function amount(c: Cuota): number {
  const v = parseFloat(c.amount)
  return Number.isNaN(v) ? 0 : v
}

export function computePortalStats(polizas: PolizaListItem[]): PortalStats {
  const now = new Date()
  const expiringLimit = new Date(now.getTime() + EXPIRING_WINDOW_DAYS * DAY_MS)

  let vigentes = 0
  let porVencer = 0
  let vencidas = 0
  let cuotasPendientes = 0
  let cuotasVencidas = 0
  let cuotasPagadas = 0
  let deudaTotal = 0

  const ramoCount = new Map<RiskType, number>()
  const vencimientos: VencimientoItem[] = []
  const monthlyMap = new Map<string, number>()

  for (const poliza of polizas) {
    // Policy validity
    const hasta = poliza.vigenciaHasta ? new Date(poliza.vigenciaHasta) : null
    if (hasta) {
      if (hasta < now) vencidas++
      else {
        vigentes++
        if (hasta <= expiringLimit) porVencer++
      }
    } else if (poliza.status.toUpperCase().includes('VIGENTE')) {
      vigentes++
    }

    // Ramo distribution
    const ramo = effectiveRiskType(poliza)
    ramoCount.set(ramo, (ramoCount.get(ramo) ?? 0) + 1)

    // Cuotas
    let nextPending: Cuota | null = null
    for (const cuota of poliza.cuotas) {
      if (cuota.status === 'paid') {
        cuotasPagadas++
      } else if (cuota.status === 'overdue') {
        cuotasVencidas++
        deudaTotal += amount(cuota)
        if (!nextPending) nextPending = cuota
        accMonthly(monthlyMap, cuota)
      } else {
        cuotasPendientes++
        deudaTotal += amount(cuota)
        if (!nextPending) nextPending = cuota
        accMonthly(monthlyMap, cuota)
      }
    }
    if (nextPending) vencimientos.push({ poliza, cuota: nextPending })
  }

  vencimientos.sort((a, b) => {
    const da = a.cuota.dueDate ? new Date(a.cuota.dueDate).getTime() : Infinity
    const db = b.cuota.dueDate ? new Date(b.cuota.dueDate).getTime() : Infinity
    return da - db
  })

  const ramos: RamoSlice[] = [...ramoCount.entries()]
    .map(([ramo, value]) => ({ ramo, value, label: RISK_LABELS[ramo], color: RISK_COLORS[ramo] }))
    .sort((a, b) => b.value - a.value)

  return {
    bienesCount: polizas.filter(isBien).length,
    polizasCount: polizas.length,
    vigentes,
    porVencer,
    vencidas,
    cuotasPendientes,
    cuotasVencidas,
    cuotasPagadas,
    deudaTotal,
    ramos,
    proximosVencimientos: vencimientos.slice(0, 5),
    monthlyDue: buildMonthlyDue(monthlyMap),
  }
}

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
}

function accMonthly(map: Map<string, number>, cuota: Cuota): void {
  if (!cuota.dueDate) return
  const d = new Date(cuota.dueDate)
  map.set(monthKey(d), (map.get(monthKey(d)) ?? 0) + amount(cuota))
}

// Next 6 months window starting from the current month, summing due amounts.
function buildMonthlyDue(map: Map<string, number>): MonthlyDue[] {
  const out: MonthlyDue[] = []
  const base = new Date()
  base.setDate(1)
  for (let i = 0; i < 6; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1)
    out.push({ label: MONTH_LABELS[d.getMonth()], total: map.get(monthKey(d)) ?? 0 })
  }
  return out
}
