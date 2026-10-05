import type { InboxConversation } from '@/src/types/api/inbox'

/**
 * A chat belongs to whoever writes from that WhatsApp number. The linked client
 * is only the insured they identified with, which may be someone else (a
 * relative writing with the holder's DNI), so it never replaces the writer
 * unless the client's phone is this very number.
 */
export function contactDisplayName(conv: InboxConversation): string {
  if (conv.client && conv.clientIsContact) return `${conv.client.firstName} ${conv.client.lastName}`
  return conv.contactName?.trim() || conv.waId
}

/** Secondary line: the client's DNI, or who the writer asked about. */
export function consultedClientLabel(conv: InboxConversation): string | null {
  if (!conv.client) return null
  if (conv.clientIsContact) return `DNI ${conv.client.dni}`
  return `Consultó por ${conv.client.firstName} ${conv.client.lastName} · DNI ${conv.client.dni}`
}
