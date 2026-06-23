import { apiRequest } from '@/src/lib/api-client'
import type {
  BusinessHoursConfig,
  Closure,
  CreateClosureRequest,
  UpdateScheduleRequest,
  WeeklySchedule,
} from '@/src/types/api/business-hours'

export const businessHoursService = {
  get: (token: string): Promise<BusinessHoursConfig> =>
    apiRequest<BusinessHoursConfig>('/admin/business-hours', { token }),

  updateSchedule: (token: string, data: UpdateScheduleRequest): Promise<{ weekly: WeeklySchedule }> =>
    apiRequest('/admin/business-hours/schedule', { method: 'PATCH', token, body: data }),

  addClosure: (token: string, data: CreateClosureRequest): Promise<Closure> =>
    apiRequest('/admin/business-hours/closures', { method: 'POST', token, body: data }),

  removeClosure: (token: string, id: number): Promise<{ ok: true }> =>
    apiRequest(`/admin/business-hours/closures/${id}`, { method: 'DELETE', token }),
}
