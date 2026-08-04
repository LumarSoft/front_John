import { apiRequest } from '@/src/lib/api-client'
import type { NovedadesPage, NovedadesQuery, NovedadesStats, NovedadItem, NovedadType } from '@/src/types/api/novedades'

function buildQuery(params: NovedadesQuery): string {
  const search = new URLSearchParams()
  if (params.type) search.set('type', params.type)
  if (params.unread) search.set('unread', 'true')
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.clientId) search.set('clientId', String(params.clientId))
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const novedadesService = {
  list: (params: NovedadesQuery, token: string) =>
    apiRequest<NovedadesPage>(`/admin/novedades${buildQuery(params)}`, { token }),
  stats: (token: string) => apiRequest<NovedadesStats>('/admin/novedades/stats', { token }),
  markRead: (id: number, token: string) =>
    apiRequest<NovedadItem>(`/admin/novedades/${id}/read`, { method: 'PATCH', token }),
  markAllRead: (type: NovedadType | undefined, token: string) =>
    apiRequest<{ updated: number }>(`/admin/novedades/read-all${type ? `?type=${type}` : ''}`, {
      method: 'PATCH',
      token,
    }),
}
