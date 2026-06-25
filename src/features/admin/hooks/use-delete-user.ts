import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/src/services/users.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useDeleteUser() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersService.remove(token as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users }),
  })
}
