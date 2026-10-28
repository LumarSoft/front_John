import { apiRequest } from '@/src/lib/api-client'
import type {
  ExpiredPoliciesPage,
  ExpiredPoliciesQuery,
  HidePolicyRequest,
  HidePolicyResponse,
  MarkExpiryNoticesResponse,
  SendExpiryNoticesResponse,
} from '@/src/types/api/expired-policies'

function buildQuery(params: ExpiredPoliciesQuery): string {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.paymentMethod) search.set('paymentMethod', params.paymentMethod)
  if (params.hidden) search.set('hidden', 'true')
  if (params.sort) search.set('sort', params.sort)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const expiredPoliciesService = {
  list(params: ExpiredPoliciesQuery, token: string): Promise<ExpiredPoliciesPage> {
    return apiRequest<ExpiredPoliciesPage>(`/admin/cobranzas/vencidas${buildQuery(params)}`, { token })
  },

  hide(token: string, id: number, data: HidePolicyRequest): Promise<HidePolicyResponse> {
    return apiRequest<HidePolicyResponse>(`/admin/cobranzas/vencidas/${id}/hide`, {
      method: 'PATCH',
      token,
      body: data,
    })
  },

  unhide(token: string, id: number): Promise<HidePolicyResponse> {
    return apiRequest<HidePolicyResponse>(`/admin/cobranzas/vencidas/${id}/unhide`, { method: 'PATCH', token })
  },

  send(token: string, ids: number[]): Promise<SendExpiryNoticesResponse> {
    return apiRequest<SendExpiryNoticesResponse>('/admin/cobranzas/vencidas/send', {
      method: 'POST',
      token,
      body: { ids },
    })
  },

  mark(token: string, ids: number[]): Promise<MarkExpiryNoticesResponse> {
    return apiRequest<MarkExpiryNoticesResponse>('/admin/cobranzas/vencidas/mark', {
      method: 'POST',
      token,
      body: { ids },
    })
  },
}
