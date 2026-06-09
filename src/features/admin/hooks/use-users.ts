import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/src/services/users.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useUsers() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.users,
    queryFn: () => usersService.list(token as string),
    enabled: !!token,
  })
}
