import { apiRequest } from '@/src/lib/api-client'
import type {
  CoverageSetting,
  ReorderCoverageSettingsRequest,
  UpdateCoverageSettingRequest,
} from '@/src/types/api/coverage-settings'

export const coverageSettingsService = {
  list: (token: string) => apiRequest<CoverageSetting[]>('/admin/coberturas', { token }),

  update: (token: string, id: number, data: UpdateCoverageSettingRequest) =>
    apiRequest<CoverageSetting>(`/admin/coberturas/${id}`, { method: 'PATCH', token, body: data }),

  reorder: (token: string, data: ReorderCoverageSettingsRequest) =>
    apiRequest<CoverageSetting[]>('/admin/coberturas/orden', { method: 'PATCH', token, body: data }),
}
