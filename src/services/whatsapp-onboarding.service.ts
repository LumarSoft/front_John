import { apiRequest } from '@/src/lib/api-client'
import type {
  EmbeddedSignupConfig,
  OnboardWhatsappRequest,
  OnboardWhatsappResponse,
} from '@/src/types/api/whatsapp-onboarding'

export const whatsappOnboardingService = {
  config: (token: string): Promise<EmbeddedSignupConfig> =>
    apiRequest<EmbeddedSignupConfig>('/admin/whatsapp/embedded-signup-config', { token }),

  onboard: (token: string, data: OnboardWhatsappRequest): Promise<OnboardWhatsappResponse> =>
    apiRequest<OnboardWhatsappResponse>('/admin/whatsapp/onboard', { method: 'POST', token, body: data }),
}
