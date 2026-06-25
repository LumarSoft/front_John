import { useQuery } from '@tanstack/react-query'
import { pricingService } from '@/src/services/pricing.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { FixedProductType } from '@/src/types/api/pricing'

export function usePlanes(productType: FixedProductType) {
  return useQuery({
    queryKey: QUERY_KEYS.pricing.plans(productType),
    queryFn: () => pricingService.getPlans(productType),
  })
}
