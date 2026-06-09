import { useQuery } from '@tanstack/react-query'
import { adminAuthService } from '@/src/services/admin-auth.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useProfile() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.profile,
    queryFn: () => adminAuthService.getProfile(token as string),
    enabled: !!token,
  })
}
