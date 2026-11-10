import { apiRequest } from '@/src/lib/api-client'
import type {
  AssignOpportunitiesRequest,
  AssignOpportunitiesResponse,
  Campaign,
  CampaignCandidatesQuery,
  CampaignCandidatesResponse,
  CampaignKind,
  CampaignOpportunity,
  CampaignResultsQuery,
  CampaignResultsResponse,
  CampaignsResponse,
  CreateCampaignTasksRequest,
  CreateCampaignTasksResponse,
  MarkCampaignResponse,
  OptInCampaignResponse,
  OptOutCampaignResponse,
  SendCampaignResponse,
  UpdateCampaignRequest,
  UpdateOpportunityRequest,
} from '@/src/types/api/campaigns'

function buildQuery(params: CampaignCandidatesQuery): string {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.coverage) search.set('coverage', params.coverage)
  if (params.reason) search.set('reason', params.reason)
  if (params.gap) search.set('gap', params.gap)
  if (params.due) search.set('due', 'true')
  if (params.status) search.set('status', params.status)
  if (params.assignedToId) search.set('assignedToId', String(params.assignedToId))
  if (params.mine) search.set('mine', 'true')
  if (params.sort) search.set('sort', params.sort)
  if (params.order) search.set('order', params.order)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

function buildResultsQuery(params: CampaignResultsQuery): string {
  const search = new URLSearchParams()
  if (params.kind) search.set('kind', params.kind)
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.assignedToId) search.set('assignedToId', String(params.assignedToId))
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

  /** "Volver a escribirle": takes them off the do-not-write list. */
  optIn(token: string, kind: CampaignKind, ids: number[]): Promise<OptInCampaignResponse> {
    return apiRequest<OptInCampaignResponse>(`/admin/campaigns/${kind}/opt-in`, {
      method: 'POST',
      token,
      body: { ids },
    })
  },

  /** "Crear tarea": one task per ticked client, and their opportunities, for one person of the office. */
  createTasks(
    token: string,
    kind: CampaignKind,
    data: CreateCampaignTasksRequest,
  ): Promise<CreateCampaignTasksResponse> {
    return apiRequest<CreateCampaignTasksResponse>(`/admin/campaigns/${kind}/tasks`, {
      method: 'POST',
      token,
      body: data,
    })
  },

  /** "Asignar a…": the ticked clients' opportunities go to one person of the office (or to nobody). */
  assign(token: string, kind: CampaignKind, data: AssignOpportunitiesRequest): Promise<AssignOpportunitiesResponse> {
    return apiRequest<AssignOpportunitiesResponse>(`/admin/campaigns/${kind}/assign`, {
      method: 'POST',
      token,
      body: data,
    })
  },

  /** Closes, reopens, annotates or reassigns one client's opportunity. */
  updateOpportunity(
    token: string,
    kind: CampaignKind,
    targetId: number,
    data: UpdateOpportunityRequest,
  ): Promise<CampaignOpportunity> {
    return apiRequest<CampaignOpportunity>(`/admin/campaigns/${kind}/opportunities/${targetId}`, {
      method: 'PATCH',
      token,
      body: data,
    })
  },

  /** How the campaigns did in a period: sent, answered, quoted, won, lost and the premium. */
  results(token: string, params: CampaignResultsQuery): Promise<CampaignResultsResponse> {
    return apiRequest<CampaignResultsResponse>(`/admin/campaigns/results${buildResultsQuery(params)}`, { token })
  },
}
