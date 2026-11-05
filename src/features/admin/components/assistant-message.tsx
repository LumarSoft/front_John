'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { Pointer } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import type { AssistantMessage as Message } from '@/src/types/api/assistant'
import { clientHref, parseReply, type ReplyInline } from '../lib/assistant-format'
import { tourStore } from '../lib/tour-store'

function Inline({ pieces, onNavigate }: { pieces: ReplyInline[]; onNavigate: () => void }) {
  return (
    <>
      {pieces.map((piece, i) => {
        const text = piece.bold ? <strong className="font-semibold text-ink">{piece.text}</strong> : piece.text
        const tourId = piece.tourId
        if (tourId) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onNavigate()
                tourStore.start(tourId)
              }}
              className="my-0.5 inline-flex items-center gap-1.5 rounded-full border border-ember-ring bg-ember-soft px-3 py-1 text-[12.5px] font-medium text-ember-2 transition-colors hover:bg-ember hover:text-on-ember"
            >
              <Pointer className="size-3.5" />
              {piece.text}
            </button>
          )
        }
        return piece.clientId ? (
          <Link
            key={i}
            href={clientHref(piece.clientId)}
            onClick={onNavigate}
            className="font-medium text-ember-2 underline decoration-ember/40 underline-offset-2 hover:decoration-ember"
          >
            {text}
          </Link>
        ) : (
          <Fragment key={i}>{text}</Fragment>
        )
      })}
    </>
  )
}

/** The assistant's reply, rendered from its light markdown with the panel's own elements. */
function Reply({ content, onNavigate }: { content: string; onNavigate: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      {parseReply(content).map((block, i) =>
        block.kind === 'list' ? (
          <ul key={i} className="flex list-disc flex-col gap-1 pl-4 marker:text-faint">
            {block.lines.map((line, j) => (
              <li key={j}>
                <Inline pieces={line} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline pieces={line} onNavigate={onNavigate} />
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  )
}

/** One message of the conversation: the user's on the right, the assistant's on the left. */
export function AssistantMessage({ message, onNavigate }: { message: Message; onNavigate: () => void }) {
  const mine = message.role === 'user'
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed break-words',
          mine
            ? 'rounded-br-md bg-ember text-on-ember whitespace-pre-wrap'
            : 'rounded-bl-md border border-line bg-secondary/60 text-ink-2',
        )}
      >
        {mine ? message.content : <Reply content={message.content} onNavigate={onNavigate} />}
      </div>
    </div>
  )
}

/** The assistant is writing. */
export function AssistantTyping() {
  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-secondary/60 px-3.5 py-3">
        <span className="sr-only">El asistente está escribiendo</span>
        {[0, 150, 300].map(delay => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-faint"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
