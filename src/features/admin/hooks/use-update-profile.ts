import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAuthService } from '@/src/services/admin-auth.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { UpdateProfileRequest } from '@/src/types/api/auth'
import { useAuth } from '../context/auth-context'

export function useUpdateProfile() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => adminAuthService.updateProfile(token as string, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.profile }),
  })
}
