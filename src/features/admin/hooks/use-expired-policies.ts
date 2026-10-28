import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { expiredPoliciesService } from '@/src/services/expired-policies.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ExpiredPoliciesQuery } from '@/src/types/api/expired-policies'
import { useAuth } from '../context/auth-context'

/** The "pólizas vencidas" worklist of the cobranzas screen; refreshes every 2 s while notices are going out. */
export function useExpiredPolicies(params: ExpiredPoliciesQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.expiredPolicies(params),
    queryFn: () => expiredPoliciesService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
    refetchInterval: query => (query.state.data?.data.some(row => row.notice?.status === 'SENDING') ? 2000 : false),
  })
}

/** Hide or bring back a policy, send the WhatsApp notice or mark it told by hand; the list refreshes after each. */
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

  const send = useMutation({
    mutationFn: (ids: number[]) => expiredPoliciesService.send(token as string, ids),
    onSuccess: refresh,
  })

  const mark = useMutation({
    mutationFn: (ids: number[]) => expiredPoliciesService.mark(token as string, ids),
    onSuccess: refresh,
  })

  return { hide, unhide, send, mark }
}
