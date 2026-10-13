import type { InboxConversation } from '@/src/types/api/inbox'

/**
 * A chat belongs to whoever writes from that WhatsApp number. The linked client
 * is only the insured they identified with, which may be someone else (a
 * relative writing with the holder's DNI), so it never replaces the writer
 * unless the client's phone is this very number.
 */
export function contactDisplayName(conv: InboxConversation): string {
  if (conv.client && isClientTheContact(conv)) return `${conv.client.firstName} ${conv.client.lastName}`
  return conv.contactName?.trim() || formatPhone(conv.waId)
}

/** True when the chat shows a person's name rather than just the number. */
export function hasContactName(conv: InboxConversation): boolean {
  return Boolean((conv.client && isClientTheContact(conv)) || conv.contactName?.trim())
}

// Argentine area codes after the 9 of mobile numbers: 11 (AMBA) has two
// digits, these have three and every other one has four.
const AR_THREE_DIGIT_AREAS = new Set([
  '220',
  '221',
  '223',
  '230',
  '236',
  '237',
  '249',
  '260',
  '261',
  '263',
  '264',
  '266',
  '280',
  '291',
  '294',
  '297',
  '298',
  '299',
  '336',
  '341',
  '342',
  '343',
  '345',
  '348',
  '351',
  '353',
  '358',
  '362',
  '364',
  '370',
  '376',
  '379',
  '380',
  '381',
  '383',
  '385',
  '387',
  '388',
])

/** A WhatsApp id as WhatsApp shows it: 5493416956364 → +54 9 341 695-6364. */
export function formatPhone(waId: string): string {
  // Area codes never start with 0: anything else is shown as it came.
  const match = /^549([1-9]\d{9})$/.exec(waId)
  if (!match) return `+${waId}`
  const national = match[1]
  const areaLength = national.startsWith('11') ? 2 : AR_THREE_DIGIT_AREAS.has(national.slice(0, 3)) ? 3 : 4
  const area = national.slice(0, areaLength)
  const local = national.slice(areaLength)
  return `+54 9 ${area} ${local.slice(0, -4)}-${local.slice(-4)}`
}

/** Secondary line: the client's DNI, or who the writer asked about. */
export function consultedClientLabel(conv: InboxConversation): string | null {
  if (!conv.client) return null
  if (isClientTheContact(conv)) return `DNI ${conv.client.dni}`
  return `Consultó por ${conv.client.firstName} ${conv.client.lastName} · DNI ${conv.client.dni}`
}

// An API without contact support omits `clientIsContact`; keep the previous
// behaviour (the client is the contact) instead of labelling every chat as a
// third-party consultation.
function isClientTheContact(conv: InboxConversation): boolean {
  return conv.clientIsContact ?? true
}
