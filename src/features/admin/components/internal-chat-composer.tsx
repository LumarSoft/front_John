import { useState, type KeyboardEvent } from 'react'
import { Loader2, SendHorizontal } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export const MESSAGE_MAX_LENGTH = 4000
// Past this many characters the box shows how many are left.
const COUNTER_FROM = MESSAGE_MAX_LENGTH - 500

interface InternalChatComposerProps {
  placeholder: string
  sending: boolean
  /** Resolves true when the message went out, so the box empties. */
  onSend: (body: string) => Promise<boolean>
}

/** Enter sends, Shift+Enter starts a new line. */
export function InternalChatComposer({ placeholder, sending, onSend }: InternalChatComposerProps) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0 && !sending

  const send = async () => {
    if (!canSend) return
    if (await onSend(text.trim())) setText('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    void send()
  }

  return (
    <footer className="shrink-0 border-t border-line-2 bg-card px-3 py-2.5">
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder={placeholder}
          aria-label="Mensaje"
          rows={1}
          className="field-sizing-content max-h-36 min-h-10 flex-1 resize-none rounded-lg border border-line-2 bg-background px-3 py-2 text-[14px] leading-5 text-ink outline-none placeholder:text-muted-foreground focus-visible:border-ember focus-visible:ring-2 focus-visible:ring-ember-ring"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!canSend}
          aria-label="Enviar"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed',
            canSend ? 'bg-ember-2 text-on-ember hover:bg-ember' : 'text-muted-foreground',
          )}
        >
          {sending ? <Loader2 className="size-5 animate-spin" /> : <SendHorizontal className="size-5" />}
        </button>
      </div>
      {text.length > COUNTER_FROM && (
        <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">
          Quedan {MESSAGE_MAX_LENGTH - text.length} caracteres
        </p>
      )}
    </footer>
  )
}
