import { apiRequest, apiStream } from '@/src/lib/api-client'
import type {
  AssistantAction,
  AssistantConversation,
  AssistantConversationSummary,
  AssistantStreamEvent,
  ConfirmAssistantActionResponse,
  SendAssistantMessageRequest,
} from '@/src/types/api/assistant'

export const assistantService = {
  /** The person's latest conversations, the most recent first. */
  conversations(token: string): Promise<AssistantConversationSummary[]> {
    return apiRequest<AssistantConversationSummary[]>('/admin/assistant/conversations', { token })
  },

  conversation(token: string, id: number): Promise<AssistantConversation> {
    return apiRequest<AssistantConversation>(`/admin/assistant/conversations/${id}`, { token })
  },

  remove(token: string, id: number): Promise<{ deleted: true }> {
    return apiRequest<{ deleted: true }>(`/admin/assistant/conversations/${id}`, { method: 'DELETE', token })
  },

  /** Asks a question; the answer arrives piece by piece through `onEvent`. */
  send(
    token: string,
    body: SendAssistantMessageRequest,
    onEvent: (event: AssistantStreamEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    return apiStream<AssistantStreamEvent>('/admin/assistant/messages', { token, body, signal }, onEvent)
  },

  /** Runs a change the assistant prepared, with the person's own permissions. */
  confirm(token: string, actionId: number): Promise<ConfirmAssistantActionResponse> {
    return apiRequest<ConfirmAssistantActionResponse>(`/admin/assistant/actions/${actionId}/confirm`, {
      method: 'POST',
      token,
    })
  },

  cancel(token: string, actionId: number): Promise<AssistantAction> {
    return apiRequest<AssistantAction>(`/admin/assistant/actions/${actionId}/cancel`, { method: 'POST', token })
  },
}
