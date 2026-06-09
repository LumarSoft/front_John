import { apiRequest } from '@/src/lib/api-client'
import type { AdminUser } from '@/src/types/api/auth'
import type { CreateUserRequest, UpdateUserRequest } from '@/src/types/api/users'

export const usersService = {
  list: (token: string): Promise<AdminUser[]> => apiRequest<AdminUser[]>('/users', { token }),

  create: (token: string, data: CreateUserRequest): Promise<AdminUser> =>
    apiRequest<AdminUser>('/users', { method: 'POST', token, body: data }),

  update: (token: string, id: number, data: UpdateUserRequest): Promise<AdminUser> =>
    apiRequest<AdminUser>(`/users/${id}`, { method: 'PATCH', token, body: data }),

  remove: (token: string, id: number): Promise<{ id: number }> =>
    apiRequest<{ id: number }>(`/users/${id}`, { method: 'DELETE', token }),
}
