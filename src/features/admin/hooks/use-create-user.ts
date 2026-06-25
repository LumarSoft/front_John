import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/src/services/users.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreateUserRequest } from '@/src/types/api/users'
import { useAuth } from '../context/auth-context'

export function useCreateUser() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersService.create(token as string, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users }),
  })
}
