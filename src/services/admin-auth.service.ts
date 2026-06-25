import { apiRequest } from '@/src/lib/api-client'
import type { AdminUser, LoginRequest, LoginResponse, UpdateProfileRequest } from '@/src/types/api/auth'

export const adminAuthService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: data }),

  getProfile: (token: string): Promise<AdminUser> => apiRequest<AdminUser>('/users/me', { token }),

  updateProfile: (token: string, data: UpdateProfileRequest): Promise<AdminUser> =>
    apiRequest<AdminUser>('/users/me', { method: 'PATCH', token, body: data }),
}
