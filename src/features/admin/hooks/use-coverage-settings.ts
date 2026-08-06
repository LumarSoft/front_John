import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coverageSettingsService } from '@/src/services/coverage-settings.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ReorderCoverageSettingsRequest, UpdateCoverageSettingRequest } from '@/src/types/api/coverage-settings'
import { useAuth } from '../context/auth-context'

export function useCoverageSettings() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.coverageSettings,
    queryFn: () => coverageSettingsService.list(token as string),
    enabled: !!token,
  })
}

export function useCoverageSettingsActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.coverageSettings })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCoverageSettingRequest }) =>
      coverageSettingsService.update(token as string, id, data),
    onSuccess: invalidate,
  })

  const reorder = useMutation({
    mutationFn: (data: ReorderCoverageSettingsRequest) => coverageSettingsService.reorder(token as string, data),
    onSuccess: invalidate,
  })

  return { update, reorder }
}
