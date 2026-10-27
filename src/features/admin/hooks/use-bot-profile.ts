import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { UpdateBotProfileRequest } from '@/src/types/api/config'
import { useAuth } from '../context/auth-context'

/** What the bot says that is particular to the organization (name, grúa, payments). */
export function useBotProfile() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.botProfile,
    queryFn: () => adminConfigService.getBotProfile(token as string),
    enabled: !!token,
  })
}

export function useUpdateBotProfile() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateBotProfileRequest) => adminConfigService.updateBotProfile(token as string, data),
    onSuccess: profile => {
      queryClient.setQueryData(QUERY_KEYS.admin.botProfile, profile)
      // The panel shows the organization's name from the profile.
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.profile })
    },
  })
}
