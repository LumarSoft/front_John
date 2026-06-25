export interface InboxConversation {
  id: number
  waId: string
  status: 'open' | 'pending' | 'closed'
  botPaused: boolean
  assignedToUserId: number | null
  assignedTo: { id: number; email: string } | null
  handedOverAt: string | null
  lastMessageAt: string | null
  sessionStartedAt: string | null
  phoneNumberId: string | null
  client: { id: number; firstName: string; lastName: string; dni: string } | null
}

export interface InboxMessage {
  id: number
  role: 'user' | 'assistant' | 'agent'
  content: string
  createdAt: string
}
