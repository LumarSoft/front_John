export type InternalChatKind = 'TEAM' | 'DIRECT'

export interface InternalChatPerson {
  id: number
  name: string | null
  email: string
}

export interface InternalChatMessage {
  id: number
  chatId: number
  body: string
  createdAt: string
  sender: InternalChatPerson
}

export interface InternalChat {
  id: number
  kind: InternalChatKind
  /** The other person of a direct chat; null for the team chat. */
  person: InternalChatPerson | null
  lastMessage: InternalChatMessage | null
  lastMessageAt: string | null
  /** Messages from others after the last one I read. */
  unread: number
}

export interface InternalChatMember {
  user: InternalChatPerson
  lastReadMessageId: number | null
}

export interface InternalChatPage {
  /** Oldest first. */
  messages: InternalChatMessage[]
  hasMore: boolean
  members: InternalChatMember[]
}

export interface InternalChatUnread {
  total: number
  latest: InternalChatMessage | null
}
