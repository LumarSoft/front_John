/** A piece of a line of the assistant's reply. */
export interface ReplyInline {
  text: string
  bold: boolean
  /** Set when the piece is a link to a client's file (`asegurado:123`). */
  clientId?: number
}

/** A paragraph (its lines, kept apart) or a bulleted list (one line per item). */
export interface ReplyBlock {
  kind: 'paragraph' | 'list'
  lines: ReplyInline[][]
}

/** The longest a question can be, as the API takes it. */
export const MAX_QUESTION = 2000

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/
const BOLD = /\*\*(.+?)\*\*/g
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g
const CLIENT_LINK = /^asegurado:(\d+)$/

/**
 * The assistant's reply as blocks of plain pieces, so the panel renders it
 * with its own elements and never as HTML: `**negrita**`, `- ` lists, line
 * breaks and `[nombre](asegurado:ID)` links. Any other link is plain text.
 */
export function parseReply(reply: string): ReplyBlock[] {
  const blocks: ReplyBlock[] = []
  let current: ReplyBlock | null = null
  for (const raw of reply.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      current = null
      continue
    }
    const kind = LIST_ITEM.test(line) ? 'list' : 'paragraph'
    if (!current || current.kind !== kind) {
      current = { kind, lines: [] }
      blocks.push(current)
    }
    current.lines.push(parseInline(kind === 'list' ? line.replace(LIST_ITEM, '') : line.trim()))
  }
  return blocks
}

function parseInline(line: string): ReplyInline[] {
  const pieces: ReplyInline[] = []
  let last = 0
  for (const match of line.matchAll(BOLD)) {
    pieces.push(...parseLinks(line.slice(last, match.index), false))
    pieces.push(...parseLinks(match[1], true))
    last = match.index + match[0].length
  }
  pieces.push(...parseLinks(line.slice(last), false))
  return pieces.filter(p => p.text)
}

function parseLinks(text: string, bold: boolean): ReplyInline[] {
  const pieces: ReplyInline[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    pieces.push({ text: text.slice(last, match.index), bold })
    const client = CLIENT_LINK.exec(match[2])
    pieces.push(client ? { text: match[1], bold, clientId: Number(client[1]) } : { text: match[1], bold })
    last = match.index + match[0].length
  }
  pieces.push({ text: text.slice(last), bold })
  return pieces
}

/** Where a client link of the reply goes: Asegurados with that client's file open. */
export function clientHref(clientId: number): string {
  return `/admin/asegurados?cliente=${clientId}`
}
