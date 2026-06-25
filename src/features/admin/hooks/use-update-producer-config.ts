import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { UpdateConfigRequest } from '@/src/types/api/config'
import { useAuth } from '../context/auth-context'

export function useUpdateProducerConfig() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateConfigRequest) => adminConfigService.update(token as string, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.config }),
  })
}
