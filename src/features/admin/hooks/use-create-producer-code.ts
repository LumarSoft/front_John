import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/src/services/users.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreateProducerCodeRequest } from '@/src/types/api/users'
import { useAuth } from '../context/auth-context'

/** A new branch's code; the code lists refresh so the new one can be granted and billed to. */
export function useCreateProducerCode() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProducerCodeRequest) => usersService.createProducerCode(token as string, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.producerCodes })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.profile })
    },
  })
}
