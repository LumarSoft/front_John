import { apiRequest } from '@/src/lib/api-client'
import type {
  SolicitudDetail,
  SolicitudesPage,
  SolicitudesQuery,
  SolicitudKind,
  UpdateSolicitudRequest,
} from '@/src/types/api/solicitudes'

function buildQuery(params: SolicitudesQuery): string {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.productType) search.set('productType', params.productType)
  if (params.kind) search.set('kind', params.kind)
  if (params.search?.trim()) search.set('search', params.search.trim())
  if (params.producerCodeId) search.set('producerCodeId', String(params.producerCodeId))
  if (params.phoneNumberId) search.set('phoneNumberId', String(params.phoneNumberId))
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const solicitudesService = {
  list: (params: SolicitudesQuery, token: string) =>
    apiRequest<SolicitudesPage>(`/admin/solicitudes${buildQuery(params)}`, { token }),

  get: (kind: SolicitudKind, id: number, token: string) =>
    apiRequest<SolicitudDetail>(`/admin/solicitudes/${kind}/${id}`, { token }),

  update: (kind: SolicitudKind, id: number, data: UpdateSolicitudRequest, token: string) =>
    apiRequest<{ ok: boolean }>(`/admin/solicitudes/${kind}/${id}`, { method: 'PATCH', token, body: data }),
}
