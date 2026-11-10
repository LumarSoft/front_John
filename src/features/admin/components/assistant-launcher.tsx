'use client'

import { useState } from 'react'
import { cn } from '@/src/lib/utils'
import { useAssistantPanel } from '../context/assistant-context'
import { AssistantLogo } from './assistant-logo'

/**
 * Opens the AI assistant. The pill in the panel's top bar, or a round icon
 * (`compact`) where a section has its own header, like Whatsapp.
 */
export function AssistantLauncher({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { available, setOpen } = useAssistantPanel()
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
        <AssistantLogo size={26} />
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
      <AssistantLogo size={22} />
      <span className="hidden font-medium sm:inline">Asistente</span>
      <kbd className="hidden rounded-md border border-line-2 bg-secondary px-1.5 py-px font-sans text-[10.5px] text-faint group-hover:border-ember-ring md:inline">
        {mac ? '⌘K' : 'Ctrl K'}
      </kbd>
      <span className="sr-only sm:hidden">Abrir el asistente</span>
    </button>
  )
}
