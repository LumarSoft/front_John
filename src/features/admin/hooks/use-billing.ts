import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingService } from '@/src/services/billing.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreateTokenPlanRequest, UpdateTokenPlanRequest } from '@/src/types/api/billing'
import { useAuth } from '../context/auth-context'

/** How often the consumption bars follow Meta's deliveries. */
const LIVE_REFRESH_MS = 10_000

/** Every number's plan and month, refreshed while the screen is open. */
export function useBillingOverview(period?: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.billing(period),
    queryFn: () => billingService.overview(token as string, period),
    enabled: !!token,
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
  })
}

export function useTokenPlans(enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.billingPlans,
    queryFn: () => billingService.plans(token as string),
    enabled: !!token && enabled,
  })
}

/** Catalog changes and plan moves; the overview and the catalog refresh after each. */
export function useBillingActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.billingAll })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
  }

  const createPlan = useMutation({
    mutationFn: (data: CreateTokenPlanRequest) => billingService.createPlan(token as string, data),
    onSuccess: refresh,
  })

  const updatePlan = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTokenPlanRequest }) =>
      billingService.updatePlan(token as string, id, data),
    onSuccess: refresh,
  })

  const removePlan = useMutation({
    mutationFn: (id: number) => billingService.removePlan(token as string, id),
    onSuccess: refresh,
  })

  const setNumberPlan = useMutation({
    mutationFn: ({ numberId, planId }: { numberId: number; planId: number | null }) =>
      billingService.setNumberPlan(token as string, numberId, planId),
    onSuccess: refresh,
  })

  return { createPlan, updatePlan, removePlan, setNumberPlan }
}
