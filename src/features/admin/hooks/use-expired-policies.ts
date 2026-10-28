import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expiredPoliciesService } from '@/src/services/expired-policies.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ExpiredPoliciesQuery } from '@/src/types/api/expired-policies'
import { useAuth } from '../context/auth-context'

/** The "pólizas vencidas" worklist of the cobranzas screen. */
export function useExpiredPolicies(params: ExpiredPoliciesQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.expiredPolicies(params),
    queryFn: () => expiredPoliciesService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

/** Hide a policy that will not be renewed, or bring one back; the list refreshes after either. */
export function useExpiredPolicyActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.expiredPoliciesAll })
  }

  const hide = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      expiredPoliciesService.hide(token as string, id, { reason }),
    onSuccess: refresh,
  })

  const unhide = useMutation({
    mutationFn: (id: number) => expiredPoliciesService.unhide(token as string, id),
    onSuccess: refresh,
  })

  return { hide, unhide }
}
