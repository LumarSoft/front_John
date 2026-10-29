import { apiRequest } from '@/src/lib/api-client'
import type {
  BillingOverview,
  CatalogPlan,
  CatalogResponse,
  CreateTokenPlanRequest,
  UpdateTokenPlanRequest,
} from '@/src/types/api/billing'

export const billingService = {
  overview(token: string, period?: string): Promise<BillingOverview> {
    const qs = period ? `?period=${encodeURIComponent(period)}` : ''
    return apiRequest<BillingOverview>(`/admin/billing${qs}`, { token })
  },

  plans(token: string): Promise<CatalogResponse> {
    return apiRequest<CatalogResponse>('/admin/billing/plans', { token })
  },

  createPlan(token: string, data: CreateTokenPlanRequest): Promise<CatalogPlan> {
    return apiRequest<CatalogPlan>('/admin/billing/plans', { method: 'POST', token, body: data })
  },

  updatePlan(token: string, id: number, data: UpdateTokenPlanRequest): Promise<CatalogPlan> {
    return apiRequest<CatalogPlan>(`/admin/billing/plans/${id}`, { method: 'PATCH', token, body: data })
  },

  removePlan(token: string, id: number): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/admin/billing/plans/${id}`, { method: 'DELETE', token })
  },
}
