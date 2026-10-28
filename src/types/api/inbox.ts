export interface InboxConversation {
  id: number
  waId: string
  status: 'open' | 'pending' | 'closed'
  botPaused: boolean
  /** True when the SuperAdmin activated human attention for the whole organization. */
  globalBotDisabled: boolean
  /** True when the bot is switched off on the number this chat came through (absent on older APIs). */
  numberBotDisabled?: boolean
  assignedToUserId: number | null
  assignedTo: { id: number; email: string } | null
  handedOverAt: string | null
  lastMessageAt: string | null
  lastInboundMessageAt?: string | null
  unreadCount: number
  lastReadAt: string | null
  customerMessageCount: number
  sessionStartedAt: string | null
  phoneNumberId: string | null
  /** Who writes from this number: name set by hand, else address-book name, else WhatsApp profile name. */
  contactName?: string | null
  /** Name an advisor set by hand (null = automatic). */
  contactNameManual?: string | null
  /** Last insured the writer identified with — not necessarily the writer. */
  client: { id: number; firstName: string; lastName: string; dni: string } | null
  /** True when the linked client's stored phone is this WhatsApp number (absent on older APIs). */
  clientIsContact?: boolean
  /** Latest message of any role, for the list preview (absent on older APIs, null for an empty chat). */
  lastMessage?: InboxLastMessage | null
}

export interface InboxLastMessage {
  role: InboxMessage['role']
  /** One line, cut at 120 characters. */
  content: string
  mediaType: 'image' | 'audio' | 'file' | null
  createdAt: string
}

export interface UpdateInboxContactRequest {
  /** Empty or null goes back to the automatic name. */
  contactName?: string | null
  unlinkClient?: boolean
}

export interface InboxMessage {
  id: number
  role: 'user' | 'assistant' | 'agent'
  content: string
  createdAt: string
  media: {
    url: string
    mimeType: string
    originalName: string
    size: number | null
    tipo: string | null
  } | null
}
