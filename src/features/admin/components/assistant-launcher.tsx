'use client'

import { useState, useSyncExternalStore } from 'react'
import { CornerDownRight } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { useAssistantPanel } from '../context/assistant-context'
import { AssistantLogo } from './assistant-logo'

/**
 * Opens the AI assistant. The pill in the panel's top bar, or a round icon
 * (`compact`) where a section has its own header, like Whatsapp.
 */
export function AssistantLauncher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { available, setOpen, busy } = useAssistantPanel()
  const [mac] = useState(() => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform))
  if (!available) return null

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`Asistente (${mac ? '⌘' : 'Ctrl+'}K)`}
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-105',
          className,
        )}
      >
        <AssistantLogo size={26} thinking={busy} />
        <span className="sr-only">Abrir el asistente</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        'group ml-auto flex h-8 items-center gap-2 rounded-full border border-line-2 bg-background py-1 pr-1.5 pl-1 text-[12.5px] text-ink-3 shadow-xs transition-colors',
        'hover:border-ember-ring hover:bg-ember-soft hover:text-ember-2',
        className,
      )}
    >
      <AssistantLogo size={22} thinking={busy} />
      <span className="hidden font-medium sm:inline">Asistente</span>
      <kbd className="hidden rounded-md border border-line-2 bg-secondary px-1.5 py-px font-sans text-[10.5px] text-faint group-hover:border-ember-ring md:inline">
        {mac ? '⌘K' : 'Ctrl K'}
      </kbd>
      <span className="sr-only sm:hidden">Abrir el asistente</span>
    </button>
  )
}

const HINT_KEY = 'assistant_fab_hint_seen'
const hintListeners = new Set<() => void>()

function subscribeHint(listener: () => void) {
  hintListeners.add(listener)
  return () => {
    hintListeners.delete(listener)
  }
}

/** Whether this browser already saw the note. Without storage, as if it had: the note never nags. */
function hintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return true
  }
}

function markHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, '1')
  } catch {
    // Without storage it may show again next time.
  }
  hintListeners.forEach(listener => listener())
}

/**
 * The assistant's round button at the bottom right of every screen, for whoever
 * misses the one in the top bar. It moves while an answer is being written and
 * shows a dot when one finished with the panel closed. The first time, a note
 * says what it is for. Not in Whatsapp, where it would cover the box to write
 * in (that screen has its own button), nor while the panel is open.
 */
export function AssistantFab({ hidden = false }: { hidden?: boolean }) {
  const { available, open, setOpen, busy, unread } = useAssistantPanel()
  const seenBefore = useSyncExternalStore(subscribeHint, hintSeen, () => true)
  const hint = !seenBefore
  const seen = markHintSeen
  if (!available || hidden || open) return null

  return (
    <div className="pointer-events-none fixed right-5 bottom-[max(20px,env(safe-area-inset-bottom))] z-40 flex items-end gap-2.5">
      {hint && (
        <div className="pointer-events-auto max-w-[250px] rounded-2xl rounded-br-md border border-line bg-card px-3.5 py-2.5 text-[12.5px] leading-snug text-ink-2 shadow-lg">
          Preguntame por tu cartera, tus campañas o cómo hacer algo en el panel.{' '}
          <button type="button" onClick={seen} className="font-medium text-ember-2 hover:underline">
            Entendido
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          seen()
          setOpen(true)
        }}
        title={unread ? 'Tu respuesta está lista' : 'Asistente'}
        className="pointer-events-auto relative grid size-12 shrink-0 place-items-center rounded-full border border-line-2 bg-background shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ember-ring focus-visible:outline-none"
      >
        <AssistantLogo size={30} thinking={busy} />
        {unread && <span className="absolute top-0.5 right-0.5 size-3 rounded-full bg-ember ring-2 ring-background" />}
        <span className="sr-only">{unread ? 'Abrir el asistente: tu respuesta está lista' : 'Abrir el asistente'}</span>
      </button>
    </div>
  )
}

/** A section's own way into the assistant: asks it a question about that screen. */
export function AskAssistantButton({
  question,
  label,
  className,
}: {
  question: string
  label: string
  className?: string
}) {
  const { available, ask } = useAssistantPanel()
  if (!available) return null
  return (
    <button
      type="button"
      onClick={() => ask(question)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-ember-ring bg-ember-soft px-3 py-1 text-[12.5px] font-medium text-ember-2 transition-colors hover:bg-ember hover:text-on-ember',
        className,
      )}
    >
      <CornerDownRight className="size-3.5" />
      {label}
    </button>
  )
}
