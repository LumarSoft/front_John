import type { ReactNode } from 'react'
import { splitByQuery } from '../lib/inbox-format'

// Order matters: a URL is consumed whole before its "_" or "*" can open a style.
const TOKEN =
  /(https?:\/\/[^\s<]+|```[\s\S]+?```|\*[^\s*](?:[^*\n]*[^\s*])?\*|_[^\s_](?:[^_\n]*[^\s_])?_|~[^\s~](?:[^~\n]*[^\s~])?~)/g
const BOUNDARY = /[\s\p{P}]/u
const URL_TRAILING_PUNCTUATION = /[.,;:!?)]+$/

const STYLE: Record<string, string> = {
  '*': 'font-semibold',
  _: 'italic',
  '~': 'line-through',
}

function isBoundary(char: string | undefined): boolean {
  return char === undefined || BOUNDARY.test(char)
}

/** Plain text with the words of an in-chat search marked, as WhatsApp does. */
function marked(text: string, query: string, keyPrefix: string): ReactNode[] {
  if (!query) return [text]
  return splitByQuery(text, query).map((part, i) =>
    part.match ? (
      <mark key={`${keyPrefix}-m${i}`} className="rounded-[2px] bg-(--wa-highlight) text-inherit">
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  )
}

/** WhatsApp markup: *bold*, _italic_, ~strike~, ```monospace``` and clickable links. */
function format(text: string, keyPrefix: string, query: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(TOKEN)) {
    let token = match[0]
    const start = match.index
    const isUrl = token.startsWith('http')
    if (!isUrl && !(isBoundary(text[start - 1]) && isBoundary(text[start + token.length]))) continue

    if (start > last) nodes.push(...marked(text.slice(last, start), query, `${keyPrefix}-${last}`))
    const key = `${keyPrefix}-${start}`

    if (isUrl) {
      const trailing = token.match(URL_TRAILING_PUNCTUATION)?.[0] ?? ''
      token = token.slice(0, token.length - trailing.length)
      nodes.push(
        <a
          key={key}
          href={token}
          target="_blank"
          rel="noreferrer"
          className="break-all text-(--wa-link) hover:underline"
        >
          {token}
        </a>,
      )
      if (trailing) nodes.push(trailing)
      last = start + token.length + trailing.length
      continue
    }

    if (token.startsWith('```')) {
      nodes.push(
        <code key={key} className="font-mono text-[13px]">
          {marked(token.slice(3, -3), query, key)}
        </code>,
      )
    } else {
      nodes.push(
        <span key={key} className={STYLE[token[0]]}>
          {format(token.slice(1, -1), key, query)}
        </span>,
      )
    }
    last = start + token.length
  }

  if (last < text.length) nodes.push(...marked(text.slice(last), query, `${keyPrefix}-${last}`))
  return nodes
}

export function InboxMessageText({ text, highlight = '' }: { text: string; highlight?: string }) {
  return <span className="whitespace-pre-wrap break-words">{format(text, 'f', highlight)}</span>
}
