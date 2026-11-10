import { apiRequest } from '@/src/lib/api-client'
import type {
  BillingOverview,
  CatalogPlan,
  CloseMonthResult,
  CatalogResponse,
  CreatePlanRequest,
  FeatureRoles,
  FeatureRolesResponse,
  OrganizationFeatures,
  PlanFeatureKey,
  OwnerBilling,
  SettlementMonth,
  SettlementSeries,
  UpdatePlanRequest,
} from '@/src/types/api/billing'

const periodQuery = (period?: string) => (period ? `?period=${encodeURIComponent(period)}` : '')

export const billingService = {
  overview(token: string, period?: string): Promise<BillingOverview> {
    return apiRequest<BillingOverview>(`/admin/billing${periodQuery(period)}`, { token })
  },

  /** At the plan's limit: continue on the next plan, or keep the assistant paused until next month. */
  resolveLimit(
    token: string,
    numberId: number,
    choice: 'continue' | 'pause',
  ): Promise<{ ok: boolean; paused: boolean }> {
    return apiRequest<{ ok: boolean; paused: boolean }>(`/admin/billing/numbers/${numberId}/limit`, {
      method: 'POST',
      token,
      body: { choice },
    })
  },

  /** The functions the organization's plans include. */
  features(token: string): Promise<OrganizationFeatures> {
    return apiRequest<OrganizationFeatures>('/admin/billing/features', { token })
  },

  assignPlan(token: string, numberId: number, planId: number): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/admin/billing/numbers/${numberId}/plan`, {
      method: 'PATCH',
      token,
      body: { planId },
    })
  },

  ownerBilling(token: string, period?: string): Promise<OwnerBilling> {
    return apiRequest<OwnerBilling>(`/owner/billing${periodQuery(period)}`, { token })
  },

  /** How a month's billing splits with the commercial partner (owner). */
  settlement(token: string, period?: string): Promise<SettlementMonth> {
    return apiRequest<SettlementMonth>(`/owner/settlement${periodQuery(period)}`, { token })
  },

  /** The last twelve months of the settlement (owner). */
  settlementSeries(token: string): Promise<SettlementSeries> {
    return apiRequest<SettlementSeries>('/owner/settlement/series', { token })
  },

  /** Freezes a month that already ended (owner). */
  closeMonth(token: string, period: string): Promise<CloseMonthResult> {
    return apiRequest<CloseMonthResult>('/owner/billing/close', { method: 'POST', token, body: { period } })
  },

  plans(token: string): Promise<CatalogResponse> {
    return apiRequest<CatalogResponse>('/owner/plans', { token })
  },

  createPlan(token: string, data: CreatePlanRequest): Promise<CatalogPlan> {
    return apiRequest<CatalogPlan>('/owner/plans', { method: 'POST', token, body: data })
  },

  updatePlan(token: string, id: number, data: UpdatePlanRequest): Promise<CatalogPlan> {
    return apiRequest<CatalogPlan>(`/owner/plans/${id}`, { method: 'PATCH', token, body: data })
  },

  /** Who may use each function besides the plan (owner). */
  featureRoles(token: string): Promise<FeatureRolesResponse> {
    return apiRequest<FeatureRolesResponse>('/owner/plan-features/roles', { token })
  },

  updateFeatureRoles(token: string, key: PlanFeatureKey, data: Partial<FeatureRoles>): Promise<FeatureRoles> {
    return apiRequest<FeatureRoles>(`/owner/plan-features/roles/${key}`, { method: 'PATCH', token, body: data })
  },

  removePlan(token: string, id: number): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/owner/plans/${id}`, { method: 'DELETE', token })
  },
}
