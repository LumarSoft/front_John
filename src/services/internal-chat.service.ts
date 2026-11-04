import { apiRequest } from '@/src/lib/api-client'
import type {
  InternalChat,
  InternalChatMessage,
  InternalChatPage,
  InternalChatPerson,
  InternalChatUnread,
} from '@/src/types/api/internal-chat'

const BASE = '/admin/internal-chat'

export const internalChatService = {
  chats(token: string): Promise<InternalChat[]> {
    return apiRequest<InternalChat[]>(`${BASE}/chats`, { token })
  },

  unread(token: string): Promise<InternalChatUnread> {
    return apiRequest<InternalChatUnread>(`${BASE}/unread`, { token })
  },

  people(token: string): Promise<InternalChatPerson[]> {
    return apiRequest<InternalChatPerson[]>(`${BASE}/people`, { token })
  },

  openDirect(token: string, userId: number): Promise<InternalChat> {
    return apiRequest<InternalChat>(`${BASE}/direct`, { method: 'POST', token, body: { userId } })
  },

  messages(token: string, chatId: number, beforeId?: number): Promise<InternalChatPage> {
    const query = beforeId ? `?beforeId=${beforeId}` : ''
    return apiRequest<InternalChatPage>(`${BASE}/chats/${chatId}/messages${query}`, { token })
  },

  send(token: string, chatId: number, body: string): Promise<InternalChatMessage> {
    return apiRequest<InternalChatMessage>(`${BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      token,
      body: { body },
    })
  },

  markRead(token: string, chatId: number, messageId: number): Promise<{ lastReadMessageId: number | null }> {
    return apiRequest<{ lastReadMessageId: number | null }>(`${BASE}/chats/${chatId}/read`, {
      method: 'POST',
      token,
      body: { messageId },
    })
  },

  removeMessage(token: string, messageId: number): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`${BASE}/messages/${messageId}`, { method: 'DELETE', token })
  },
}
