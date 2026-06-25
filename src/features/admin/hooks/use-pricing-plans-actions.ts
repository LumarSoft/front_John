import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pricingPlansService } from '@/src/services/pricing-plans.service'
import type { CreatePlanRequest, UpdatePlanRequest } from '@/src/types/api/pricing'
import { useAuth } from '../context/auth-context'

export function usePricingPlansActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] })
  }

  const create = useMutation({
    mutationFn: (data: CreatePlanRequest) => pricingPlansService.create(token as string, data),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      pricingPlansService.update(token as string, id, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => pricingPlansService.remove(token as string, id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
