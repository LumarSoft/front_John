import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useSetBotStatus() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (botEnabled: boolean) => adminConfigService.setBotStatus(token as string, { botEnabled }),
    onSuccess: config => {
      queryClient.setQueryData(QUERY_KEYS.admin.config, config)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inbox'] })
    },
  })
}
