import { apiRequest } from '@/src/lib/api-client'
import type {
  AdminPhoneNumber,
  CreatePhoneNumberRequest,
  NumberAssistant,
  UpdateNumberAssistantRequest,
  UpdatePhoneNumberRequest,
} from '@/src/types/api/phone-numbers'

export const phoneNumbersService = {
  list: (token: string, period?: string): Promise<AdminPhoneNumber[]> =>
    apiRequest<AdminPhoneNumber[]>(`/admin/phone-numbers${period ? `?period=${encodeURIComponent(period)}` : ''}`, {
      token,
    }),

  create: (token: string, data: CreatePhoneNumberRequest): Promise<{ id: number }> =>
    apiRequest<{ id: number }>('/admin/phone-numbers', { method: 'POST', token, body: data }),

  update: (token: string, id: number, data: UpdatePhoneNumberRequest): Promise<{ id: number }> =>
    apiRequest<{ id: number }>(`/admin/phone-numbers/${id}`, { method: 'PATCH', token, body: data }),

  remove: (token: string, id: number): Promise<{ id: number }> =>
    apiRequest<{ id: number }>(`/admin/phone-numbers/${id}`, { method: 'DELETE', token }),

  getAssistant: (token: string, id: number): Promise<NumberAssistant> =>
    apiRequest<NumberAssistant>(`/admin/phone-numbers/${id}/assistant`, { token }),

  updateAssistant: (token: string, id: number, data: UpdateNumberAssistantRequest): Promise<NumberAssistant> =>
    apiRequest<NumberAssistant>(`/admin/phone-numbers/${id}/assistant`, { method: 'PATCH', token, body: data }),
}
