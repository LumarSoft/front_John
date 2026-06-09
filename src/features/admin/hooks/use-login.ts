import { useMutation } from '@tanstack/react-query'
import { adminAuthService } from '@/src/services/admin-auth.service'
import type { LoginRequest } from '@/src/types/api/auth'
import { useAuth } from '../context/auth-context'

export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (data: LoginRequest) => adminAuthService.login(data),
    onSuccess: response => login(response.access_token),
  })
}
