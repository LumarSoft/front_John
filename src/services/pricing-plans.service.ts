import { apiRequest } from '@/src/lib/api-client'
import type { CreatePlanRequest, ProductPlan, UpdatePlanRequest } from '@/src/types/api/pricing'

export const pricingPlansService = {
  list: (token: string) => apiRequest<ProductPlan[]>('/admin/pricing', { token }),

  create: (token: string, data: CreatePlanRequest) =>
    apiRequest<ProductPlan>('/admin/pricing', { method: 'POST', token, body: data }),

  update: (token: string, id: number, data: UpdatePlanRequest) =>
    apiRequest<ProductPlan>(`/admin/pricing/${id}`, { method: 'PATCH', token, body: data }),

  remove: (token: string, id: number) =>
    apiRequest<{ ok: boolean }>(`/admin/pricing/${id}`, { method: 'DELETE', token }),
}
