import { apiRequest } from '@/src/lib/api-client'
import type { BotProfile, ProducerConfig, UpdateBotProfileRequest, UpdateConfigRequest } from '@/src/types/api/config'

export const adminConfigService = {
  get: (token: string): Promise<ProducerConfig> => apiRequest<ProducerConfig>('/admin/config', { token }),

  update: (token: string, data: UpdateConfigRequest): Promise<ProducerConfig> =>
    apiRequest<ProducerConfig>('/admin/config', { method: 'PATCH', token, body: data }),

  getBotProfile: (token: string): Promise<BotProfile> => apiRequest<BotProfile>('/admin/config/profile', { token }),

  updateBotProfile: (token: string, data: UpdateBotProfileRequest): Promise<BotProfile> =>
    apiRequest<BotProfile>('/admin/config/profile', { method: 'PATCH', token, body: data }),

  uploadLogo: (token: string, file: File): Promise<{ logoUrl: string }> => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest<{ logoUrl: string }>('/admin/config/logo', { method: 'POST', token, body })
  },

  removeLogo: (token: string): Promise<{ logoUrl: null }> =>
    apiRequest<{ logoUrl: null }>('/admin/config/logo', { method: 'DELETE', token }),
}
