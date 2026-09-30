import { apiRequest } from '@/src/lib/api-client'
import type { ProducerConfig, SetBotStatusRequest, UpdateConfigRequest } from '@/src/types/api/config'

export const adminConfigService = {
  get: (token: string): Promise<ProducerConfig> => apiRequest<ProducerConfig>('/admin/config', { token }),

  update: (token: string, data: UpdateConfigRequest): Promise<ProducerConfig> =>
    apiRequest<ProducerConfig>('/admin/config', { method: 'PATCH', token, body: data }),

  setBotStatus: (token: string, data: SetBotStatusRequest): Promise<ProducerConfig> =>
    apiRequest<ProducerConfig>('/admin/config/bot-status', { method: 'PATCH', token, body: data }),
}
