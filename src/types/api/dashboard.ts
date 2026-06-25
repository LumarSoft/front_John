export interface RenovacionPoint {
  month: string
  label: string
  total: number
  prima: string
}

export interface DashboardKpis {
  asegurados: number
  solicitudesNuevas: number
  cuotasVencidas: number
  montoDeudaTotal: string
  siniestrosAbiertos: number
}

export interface DashboardData {
  kpis: DashboardKpis
  renovaciones: { primaEnRiesgo: string; timeline: RenovacionPoint[] }
  cartera: { vigentes: number; porVencer: number; vencidas: number }
  solicitudesPorEstado: { nuevas: number; contactadas: number; cerradas: number }
  cobranzas: { pendientes: number; vencidas: number; rechazadas: number }
  siniestrosPorEstado: { pendiente: number; enProceso: number; resuelto: number }
}
