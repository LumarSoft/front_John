import type { FixedProductType, ProductPlan } from '@/src/types/api/pricing'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const pricingService = {
  getPlans: async (productType: FixedProductType): Promise<ProductPlan[]> => {
    const res = await fetch(`${API_URL}/pricing/${productType}`)
    if (!res.ok) throw new Error(`Pricing error: ${res.status}`)
    return res.json() as Promise<ProductPlan[]>
  },
}
