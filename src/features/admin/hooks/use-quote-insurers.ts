import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { UpdateQuoteInsurersRequest } from '@/src/types/api/config'
import { useAuth } from '../context/auth-context'

/** The insurers the organization's bot quotes with, and what each one lacks. */
export function useQuoteInsurers() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.quoteInsurers,
    queryFn: () => adminConfigService.getQuoteInsurers(token as string),
    enabled: !!token,
  })
}

/** Switches an insurer; turning one on fails with the reason when it gives no token. */
export function useUpdateQuoteInsurers() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateQuoteInsurersRequest) => adminConfigService.updateQuoteInsurers(token as string, data),
    onSuccess: data => queryClient.setQueryData(QUERY_KEYS.admin.quoteInsurers, data),
  })
}
