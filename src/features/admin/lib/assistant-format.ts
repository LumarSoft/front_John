import { isScreenId, screenHref } from './panel-screens'
import { isTourId, type TourId } from './panel-tours'

/** A piece of a line of the assistant's reply. */
export interface ReplyInline {
  text: string
  bold: boolean
  /** Set when the piece is a link to a client's file (`asegurado:123`). */
  clientId?: number
  /** Set when the piece is the button of an on-screen guide (`recorrido:cargar-rechazos`). */
  tourId?: TourId
  /** Set when the piece is a button to a screen of the panel (`pantalla:config-horarios`). */
  screenId?: string
  /** The record that screen opens (`pantalla:numero-pagos/12`). */
  recordId?: number
  /** A value written between backticks (an alias, a CBU): shown as a value to copy. */
  code?: boolean
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
const CODE = /`([^`]+)`/g
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g
const CLIENT_LINK = /^asegurado:(\d+)$/
const TOUR_LINK = /^recorrido:([a-z-]+)$/
const SCREEN_LINK = /^pantalla:([a-z0-9-]+)(?:\/(\d+))?$/

/**
 * The assistant's reply as blocks of plain pieces, so the panel renders it
 * with its own elements and never as HTML: `**negrita**`, `- ` lists, line
 * breaks, `[nombre](asegurado:ID)` links, `[Ir a …](pantalla:ID)` screens and
 * `[Mostrame en pantalla](recorrido:ID)` guides the panel has. Any other link is
 * plain text.
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
  for (const match of line.matchAll(CODE)) {
    pieces.push(...parseBold(line.slice(last, match.index)))
    pieces.push({ text: match[1], bold: false, code: true })
    last = match.index + match[0].length
  }
  pieces.push(...parseBold(line.slice(last)))
  return pieces.filter(p => p.text)
}

function parseBold(text: string): ReplyInline[] {
  const pieces: ReplyInline[] = []
  let last = 0
  for (const match of text.matchAll(BOLD)) {
    pieces.push(...parseLinks(text.slice(last, match.index), false))
    pieces.push(...parseLinks(match[1], true))
    last = match.index + match[0].length
  }
  pieces.push(...parseLinks(text.slice(last), false))
  return pieces
}

function parseLinks(text: string, bold: boolean): ReplyInline[] {
  const pieces: ReplyInline[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    pieces.push({ text: text.slice(last, match.index), bold })
    pieces.push(linkPiece(match[1], match[2], bold))
    last = match.index + match[0].length
  }
  pieces.push({ text: text.slice(last), bold })
  return pieces
}

function linkPiece(text: string, target: string, bold: boolean): ReplyInline {
  const client = CLIENT_LINK.exec(target)
  if (client) return { text, bold, clientId: Number(client[1]) }
  const tour = TOUR_LINK.exec(target)?.[1]
  if (tour && isTourId(tour)) return { text, bold, tourId: tour }
  const screen = SCREEN_LINK.exec(target)
  if (screen && isScreenId(screen[1])) {
    return { text, bold, screenId: screen[1], ...(screen[2] ? { recordId: Number(screen[2]) } : {}) }
  }
  return { text, bold }
}

/** Where a client link of the reply goes: Asegurados with that client's file open. */
export function clientHref(clientId: number): string {
  return `/admin/asegurados?cliente=${clientId}`
}

/** Where a screen link of the reply goes: the screen, its tab and section, and the record it opens. */
export function replyScreenHref(piece: Pick<ReplyInline, 'screenId' | 'recordId'>): string {
  return screenHref(piece.screenId ?? 'inicio', piece.recordId)
}
