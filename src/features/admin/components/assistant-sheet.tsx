'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AlertCircle, ArrowUp, Lock, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import type { AssistantMessage as Message } from '@/src/types/api/assistant'
import { MAX_QUESTION } from '../lib/assistant-format'
import { AssistantMessage, AssistantTyping } from './assistant-message'

/** Questions the empty conversation offers; `fill` puts the text in the box instead of sending it. */
const SUGGESTIONS: Array<{ label: string; fill?: string }> = [
  { label: '¿Cuál es el estado de la póliza de …?', fill: '¿Cuál es el estado de la póliza de ' },
  { label: '¿Qué pólizas vencen esta semana?' },
  { label: '¿Quiénes tienen cuotas rechazadas?' },
  { label: 'Resumen de la cartera' },
]

interface AssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: Message[]
  pending: boolean
  error: string | null
  onSend: (text: string) => void
  onRetry: () => void
  onReset: () => void
  plan: { included: boolean; availableIn: string | null }
}

export function AssistantSheet({
  open,
  onOpenChange,
  messages,
  pending,
  error,
  onSend,
  onRetry,
  onReset,
  plan,
}: AssistantSheetProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // The newest message (or the typing dots) always in view.
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' })
  }, [open, messages.length, pending, error])

  const submit = () => {
    if (!draft.trim() || pending) return
    onSend(draft)
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const suggest = (suggestion: (typeof SUGGESTIONS)[number]) => {
    if (suggestion.fill) {
      setDraft(suggestion.fill)
      requestAnimationFrame(() => {
        const input = inputRef.current
        input?.focus()
        input?.setSelectionRange(input.value.length, input.value.length)
      })
    } else {
      onSend(suggestion.label)
    }
  }

  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[420px]">
        <SheetHeader className="border-b border-line pr-12">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2 font-display text-[16px] tracking-[-0.01em] text-ink">
              <Sparkles className="size-4 text-ember-2" /> Asistente
            </SheetTitle>
            {plan.included && messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={pending}
                className="h-7 px-2 text-[12px] text-muted-foreground"
              >
                <RotateCcw className="size-3.5" /> Nueva conversación
              </Button>
            )}
          </div>
          <SheetDescription className="text-[12.5px]">
            Preguntale por clientes, pólizas, cuotas y vencimientos. Solo consulta: no envía mensajes ni cambia nada.
          </SheetDescription>
        </SheetHeader>

        {!plan.included ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <Lock className="size-5 text-faint" />
            <p className="text-[14px] font-medium text-ink">Tu plan no incluye el asistente con IA</p>
            <p className="text-[13px] text-muted-foreground">
              {plan.availableIn
                ? `Está desde el plan ${plan.availableIn}. El plan de cada número se elige en Facturación.`
                : 'El plan de cada número se elige en Facturación.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && !pending ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] text-muted-foreground">Por ejemplo:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => suggest(suggestion)}
                        className="rounded-full border border-line-2 bg-background px-3 py-1.5 text-left text-[12.5px] text-ink-3 transition-colors hover:border-ember hover:bg-ember-soft hover:text-ember-2"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, i) => <AssistantMessage key={i} message={message} onNavigate={close} />)
              )}
              {pending && <AssistantTyping />}
              {error && !pending && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="self-start font-medium underline underline-offset-2"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="flex items-end gap-2 border-t border-line p-3"
              onSubmit={event => {
                event.preventDefault()
                submit()
              }}
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={event => setDraft(event.target.value.slice(0, MAX_QUESTION))}
                onKeyDown={onKeyDown}
                disabled={pending}
                rows={2}
                maxLength={MAX_QUESTION}
                placeholder="Escribí tu pregunta…"
                aria-label="Pregunta para el asistente"
                className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-line-2 bg-background px-3 py-2 text-[13.5px] leading-relaxed text-ink placeholder:text-faint focus-visible:border-ember focus-visible:outline-none disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                disabled={pending || !draft.trim()}
                className="size-10 shrink-0 rounded-full"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
