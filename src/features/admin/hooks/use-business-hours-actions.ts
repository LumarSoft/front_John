import { useMutation, useQueryClient } from '@tanstack/react-query'
import { businessHoursService } from '@/src/services/business-hours.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { WeeklySchedule } from '@/src/types/api/business-hours'
import { useAuth } from '../context/auth-context'

export function useBusinessHoursActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.businessHours })

  const updateSchedule = useMutation({
    mutationFn: (weekly: WeeklySchedule) => businessHoursService.updateSchedule(token as string, { weekly }),
    onSuccess: invalidate,
  })

  return { updateSchedule }
}
