import { apiRequest } from '@/src/lib/api-client'
import type {
  BotProfile,
  ProducerConfig,
  SetBotStatusRequest,
  UpdateBotProfileRequest,
  UpdateConfigRequest,
} from '@/src/types/api/config'

export const adminConfigService = {
  get: (token: string): Promise<ProducerConfig> => apiRequest<ProducerConfig>('/admin/config', { token }),

  update: (token: string, data: UpdateConfigRequest): Promise<ProducerConfig> =>
    apiRequest<ProducerConfig>('/admin/config', { method: 'PATCH', token, body: data }),

  setBotStatus: (token: string, data: SetBotStatusRequest): Promise<ProducerConfig> =>
    apiRequest<ProducerConfig>('/admin/config/bot-status', { method: 'PATCH', token, body: data }),

  getBotProfile: (token: string): Promise<BotProfile> => apiRequest<BotProfile>('/admin/config/profile', { token }),

  updateBotProfile: (token: string, data: UpdateBotProfileRequest): Promise<BotProfile> =>
    apiRequest<BotProfile>('/admin/config/profile', { method: 'PATCH', token, body: data }),
}
