import { apiRequest } from '@/src/lib/api-client'
import type { DashboardData } from '@/src/types/api/dashboard'

export const dashboardService = {
  get: (token: string, scope?: { producerCodeId?: number; phoneNumberId?: number }) => {
    const params = new URLSearchParams()
    if (scope?.producerCodeId) params.set('producerCodeId', String(scope.producerCodeId))
    if (scope?.phoneNumberId) params.set('phoneNumberId', String(scope.phoneNumberId))
    const qs = params.toString()
    return apiRequest<DashboardData>(`/admin/dashboard${qs ? `?${qs}` : ''}`, { token })
  },
}
