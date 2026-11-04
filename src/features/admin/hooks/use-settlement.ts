import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { billingService } from '@/src/services/billing.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/** The running month moves with every delivery; a closed one never changes. */
const LIVE_REFRESH_MS = 60_000

/** One month of the settlement with the commercial partner (owner). */
export function useSettlement(period: string, live: boolean) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.settlement(period),
    queryFn: () => billingService.settlement(token as string, period),
    enabled: !!token,
    placeholderData: keepPreviousData,
    refetchInterval: live ? LIVE_REFRESH_MS : false,
  })
}

/** The last twelve months of the settlement (owner). */
export function useSettlementSeries() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.settlementSeries,
    queryFn: () => billingService.settlementSeries(token as string),
    enabled: !!token,
  })
}

/** Freezes a month that already ended; the settlement and the Tablero read it from its close afterwards. */
export function useCloseMonth() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (period: string) => billingService.closeMonth(token as string, period),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.settlementAll })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.billingAll })
    },
  })
}
