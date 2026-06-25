import { useQuery } from '@tanstack/react-query'
import { pricingPlansService } from '@/src/services/pricing-plans.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function usePricingPlans() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.pricingPlans,
    queryFn: () => pricingPlansService.list(token as string),
    enabled: !!token,
  })
}
