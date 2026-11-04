'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useAssistant } from '../hooks/use-assistant'
import { usePlanFeature } from '../hooks/use-billing'
import { AssistantSheet } from './assistant-sheet'

/**
 * The AI assistant's button in the panel's top bar. The conversation lives
 * here, so it carries on while the user moves between sections.
 */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false)
  const assistant = useAssistant()
  const plan = usePlanFeature('ai_assistant')

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="ml-auto h-8 gap-1.5 rounded-full border-line-2 px-2.5 text-[12.5px] text-ink-3 hover:border-ember hover:bg-ember-soft hover:text-ember-2 sm:px-3"
      >
        <Sparkles className="size-4 text-ember-2" />
        <span className="hidden sm:inline">Asistente</span>
        <span className="sr-only sm:hidden">Abrir el asistente</span>
      </Button>
      <AssistantSheet
        open={open}
        onOpenChange={setOpen}
        messages={assistant.messages}
        pending={assistant.pending}
        error={assistant.error}
        onSend={assistant.send}
        onRetry={assistant.retry}
        onReset={assistant.reset}
        plan={plan}
      />
    </>
  )
}
