import type { ReactNode } from 'react'

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

/** WhatsApp markup: *bold*, _italic_, ~strike~, ```monospace``` and clickable links. */
function format(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of text.matchAll(TOKEN)) {
    let token = match[0]
    const start = match.index
    const isUrl = token.startsWith('http')
    if (!isUrl && !(isBoundary(text[start - 1]) && isBoundary(text[start + token.length]))) continue

    if (start > last) nodes.push(text.slice(last, start))
    const key = `${keyPrefix}-${start}`

    if (isUrl) {
      const trailing = token.match(URL_TRAILING_PUNCTUATION)?.[0] ?? ''
      token = token.slice(0, token.length - trailing.length)
      nodes.push(
        <a key={key} href={token} target="_blank" rel="noreferrer" className="break-all text-[#027eb5] hover:underline">
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
          {token.slice(3, -3)}
        </code>,
      )
    } else {
      nodes.push(
        <span key={key} className={STYLE[token[0]]}>
          {format(token.slice(1, -1), key)}
        </span>,
      )
    }
    last = start + token.length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function InboxMessageText({ text }: { text: string }) {
  return <span className="whitespace-pre-wrap break-words">{format(text, 'f')}</span>
}
