import { apiRequest } from '@/src/lib/api-client'
import type { CobranzasPage, CobranzasQuery, CobranzasStats } from '@/src/types/api/cobranzas'

function buildQuery(params: CobranzasQuery): string {
  const search = new URLSearchParams()
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.estado) search.set('estado', params.estado)
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const cobranzasService = {
  list: (params: CobranzasQuery, token: string) =>
    apiRequest<CobranzasPage>(`/admin/cobranzas${buildQuery(params)}`, { token }),
  stats: (token: string) => apiRequest<CobranzasStats>('/admin/cobranzas/stats', { token }),
}
