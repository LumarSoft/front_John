export interface RenewalPoint {
  month: string
  label: string
  total: number
  premium: string
}

export interface DashboardKpis {
  insuredClients: number
  newRequests: number
  overdueInstallments: number
  totalDebt: string
  openClaims: number
}

export interface DashboardData {
  kpis: DashboardKpis
  renewals: { premiumAtRisk: string; timeline: RenewalPoint[] }
  portfolio: { inForce: number; expiringSoon: number; expired: number }
  requestsByStatus: { new: number; contacted: number; closed: number }
  collections: { pending: number; overdue: number; rejected: number }
  claimsByStatus: { pending: number; inProgress: number; resolved: number }
}
