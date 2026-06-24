import { apiRequest } from '@/src/lib/api-client'
import type { DashboardData } from '@/src/types/api/dashboard'

export const dashboardService = {
  get: (token: string) => apiRequest<DashboardData>('/admin/dashboard', { token }),
}
