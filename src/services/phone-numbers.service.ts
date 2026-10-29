import { apiRequest } from '@/src/lib/api-client'
import type { Closure, CreateClosureRequest } from '@/src/types/api/business-hours'
import type {
  AdminPhoneNumber,
  CreatePhoneNumberRequest,
  NumberAssistant,
  NumberBotStatus,
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

  /** The number's own bot switch; the admin of the number may flip it. */
  setBotStatus: (token: string, id: number, data: { botEnabled: boolean }): Promise<NumberBotStatus> =>
    apiRequest<NumberBotStatus>(`/admin/phone-numbers/${id}/bot-status`, { method: 'PATCH', token, body: data }),

  /** Closes the number for a day or a range; only this number. */
  addClosure: (token: string, id: number, data: CreateClosureRequest): Promise<Closure> =>
    apiRequest<Closure>(`/admin/phone-numbers/${id}/closures`, { method: 'POST', token, body: data }),

  removeClosure: (token: string, id: number, closureId: number): Promise<{ ok: true }> =>
    apiRequest<{ ok: true }>(`/admin/phone-numbers/${id}/closures/${closureId}`, { method: 'DELETE', token }),
}
