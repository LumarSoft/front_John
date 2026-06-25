import { useQuery } from '@tanstack/react-query'
import { businessHoursService } from '@/src/services/business-hours.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useBusinessHours() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.businessHours,
    queryFn: () => businessHoursService.get(token as string),
    enabled: !!token,
  })
}
