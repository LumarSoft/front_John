import { apiRequest } from '@/src/lib/api-client'
import type {
  Campaign,
  CampaignCandidatesQuery,
  CampaignCandidatesResponse,
  CampaignKind,
  CampaignsResponse,
  MarkCampaignResponse,
  OptOutCampaignResponse,
  SendCampaignResponse,
  UpdateCampaignRequest,
} from '@/src/types/api/campaigns'

function buildQuery(params: CampaignCandidatesQuery): string {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.coverage) search.set('coverage', params.coverage)
  if (params.reason) search.set('reason', params.reason)
  if (params.sort) search.set('sort', params.sort)
  if (params.order) search.set('order', params.order)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const campaignsService = {
  list(token: string): Promise<CampaignsResponse> {
    return apiRequest<CampaignsResponse>('/admin/campaigns', { token })
  },

  /** A new body goes to Meta for review; the percentage and the settings do not. */
  update(token: string, kind: CampaignKind, data: UpdateCampaignRequest): Promise<Campaign> {
    return apiRequest<Campaign>(`/admin/campaigns/${kind}`, { method: 'PATCH', token, body: data })
  },

  /** Asks Meta again how the review of the campaign's message is going. */
  refreshTemplates(token: string, kind: CampaignKind): Promise<Campaign> {
    return apiRequest<Campaign>(`/admin/campaigns/${kind}/templates/refresh`, { method: 'POST', token })
  },

  candidates(token: string, kind: CampaignKind, params: CampaignCandidatesQuery): Promise<CampaignCandidatesResponse> {
    return apiRequest<CampaignCandidatesResponse>(`/admin/campaigns/${kind}/candidates${buildQuery(params)}`, {
      token,
    })
  },

  send(token: string, kind: CampaignKind, ids: number[]): Promise<SendCampaignResponse> {
    return apiRequest<SendCampaignResponse>(`/admin/campaigns/${kind}/send`, { method: 'POST', token, body: { ids } })
  },

  /** "Ya lo contactamos": not offered again for a while. */
  mark(token: string, kind: CampaignKind, ids: number[]): Promise<MarkCampaignResponse> {
    return apiRequest<MarkCampaignResponse>(`/admin/campaigns/${kind}/mark`, { method: 'POST', token, body: { ids } })
  },

  /** "No escribirle más": left out of every campaign. */
  optOut(token: string, kind: CampaignKind, ids: number[]): Promise<OptOutCampaignResponse> {
    return apiRequest<OptOutCampaignResponse>(`/admin/campaigns/${kind}/opt-out`, {
      method: 'POST',
      token,
      body: { ids },
    })
  },
}
