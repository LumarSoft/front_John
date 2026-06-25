import { apiRequest } from '@/src/lib/api-client'
import type { InboxConversation, InboxMessage } from '@/src/types/api/inbox'

export const inboxService = {
  listConversations(token: string, status?: string, search?: string): Promise<InboxConversation[]> {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search?.trim()) params.set('search', search.trim())
    const qs = params.toString()
    return apiRequest<InboxConversation[]>(`/admin/inbox${qs ? `?${qs}` : ''}`, { token })
  },

  getMessages(conversationId: number, token: string): Promise<InboxMessage[]> {
    return apiRequest<InboxMessage[]>(`/admin/inbox/${conversationId}/messages`, { token })
  },

  takeover(conversationId: number, token: string): Promise<InboxConversation> {
    return apiRequest<InboxConversation>(`/admin/inbox/${conversationId}/takeover`, {
      method: 'POST',
      token,
    })
  },

  release(conversationId: number, token: string): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/admin/inbox/${conversationId}/release`, {
      method: 'POST',
      token,
    })
  },

  sendMessage(conversationId: number, text: string, token: string): Promise<InboxMessage> {
    return apiRequest<InboxMessage>(`/admin/inbox/${conversationId}/message`, {
      method: 'POST',
      token,
      body: { text },
    })
  },
}
