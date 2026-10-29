import { apiRequest } from '@/src/lib/api-client'
import type { BusinessHoursConfig, UpdateScheduleRequest, WeeklySchedule } from '@/src/types/api/business-hours'

export const businessHoursService = {
  get: (token: string): Promise<BusinessHoursConfig> =>
    apiRequest<BusinessHoursConfig>('/admin/business-hours', { token }),

  updateSchedule: (token: string, data: UpdateScheduleRequest): Promise<{ weekly: WeeklySchedule }> =>
    apiRequest('/admin/business-hours/schedule', { method: 'PATCH', token, body: data }),
}
