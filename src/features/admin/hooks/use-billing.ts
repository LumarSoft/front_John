import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingService } from '@/src/services/billing.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreatePlanRequest, UpdatePlanRequest } from '@/src/types/api/billing'
import { useAuth } from '../context/auth-context'

/** How often the consumption bars follow Meta's deliveries. */
const LIVE_REFRESH_MS = 10_000

/** Every number's plan and month, refreshed while the screen is open. */
export function useBillingOverview(period?: string, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.billing(period),
    queryFn: () => billingService.overview(token as string, period),
    enabled: !!token && enabled,
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
  })
}

/** The SuperAdmin puts a number on a plan; the month and the numbers refresh after it. */
export function useAssignPlan() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ numberId, planId }: { numberId: number; planId: number }) =>
      billingService.assignPlan(token as string, numberId, planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.billingAll })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
    },
  })
}

/** The office's answer at a number's plan limit; the month, the numbers and the notices refresh after it. */
export function useResolveLimit() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ numberId, choice }: { numberId: number; choice: 'continue' | 'pause' }) =>
      billingService.resolveLimit(token as string, numberId, choice),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.billingAll })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'novedades'] })
    },
  })
}

/** The owner's month across the platform: billed, Meta, OpenAI and profit. */
export function useOwnerBilling(period?: string, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.billing(period),
    queryFn: () => billingService.ownerBilling(token as string, period),
    enabled: !!token && enabled,
    placeholderData: keepPreviousData,
    refetchInterval: LIVE_REFRESH_MS,
  })
}

/** The platform's catalog (owner). */
export function useOwnerPlans(enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.plans,
    queryFn: () => billingService.plans(token as string),
    enabled: !!token && enabled,
  })
}

/** Catalog changes (owner); every billing screen refreshes after each. */
export function usePlanActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.plans })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.billingAll })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.billingAll })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
  }

  const createPlan = useMutation({
    mutationFn: (data: CreatePlanRequest) => billingService.createPlan(token as string, data),
    onSuccess: refresh,
  })

  const updatePlan = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      billingService.updatePlan(token as string, id, data),
    onSuccess: refresh,
  })

  const removePlan = useMutation({
    mutationFn: (id: number) => billingService.removePlan(token as string, id),
    onSuccess: refresh,
  })

  return { createPlan, updatePlan, removePlan }
}
