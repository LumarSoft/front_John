import { apiRequest } from '@/src/lib/api-client'
import type { AskAssistantRequest, AskAssistantResponse } from '@/src/types/api/assistant'

export const assistantService = {
  /** Asks the AI assistant about the organization's portfolio; it can take several seconds. */
  ask(token: string, data: AskAssistantRequest): Promise<AskAssistantResponse> {
    return apiRequest<AskAssistantResponse>('/admin/assistant/ask', { method: 'POST', token, body: data })
  },
}
