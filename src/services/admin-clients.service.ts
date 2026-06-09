import { apiRequest } from '@/src/lib/api-client'
import type { AdminClientDetail, AdminClientsPage, AdminClientsQuery, AdminClientsStats } from '@/src/types/api/clients'

function buildListQuery(params: AdminClientsQuery): string {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.riskType) search.set('riskType', params.riskType)
  if (params.estado) search.set('estado', params.estado)
  if (params.sort) search.set('sort', params.sort)
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adminClientsService = {
  list: (params: AdminClientsQuery, token: string) =>
    apiRequest<AdminClientsPage>(`/admin/clients${buildListQuery(params)}`, { token }),
  stats: (token: string) => apiRequest<AdminClientsStats>('/admin/clients/stats', { token }),
  get: (id: number, token: string) => apiRequest<AdminClientDetail>(`/admin/clients/${id}`, { token }),
}
