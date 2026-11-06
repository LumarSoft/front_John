'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, ArrowRight, ArrowUp, ChevronLeft, History, Loader2, Lock, Square, SquarePen } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { cn } from '@/src/lib/utils'
import type { AssistantMessage, AssistantStep } from '@/src/types/api/assistant'
import type { AssistantState } from '../hooks/use-assistant'
import { useProfile } from '../hooks/use-profile'
import { MAX_QUESTION } from '../lib/assistant-format'
import { suggestionsFor, type AssistantSuggestion } from '../lib/assistant-suggestions'
import { AssistantHistory } from './assistant-history'
import { AssistantLogo } from './assistant-logo'
import { AssistantTurn, UserBubble } from './assistant-message'

interface AssistantPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assistant: AssistantState
  plan: { included: boolean; availableIn: string | null; byRole?: boolean }
  route?: string
}

const savedSteps = (message: AssistantMessage): AssistantStep[] =>
  message.steps.map((label, i) => ({ id: `${message.id}-${i}`, label, state: 'done' }))

/** The assistant's side panel: the conversation, the history, and the box to ask. */
export function AssistantPanel({ open, onOpenChange, assistant, plan, route }: AssistantPanelProps) {
  const { data: profile } = useProfile()
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, live, streaming } = assistant
  const empty = messages.length === 0 && !live && !assistant.loading

  // The newest content in view while the answer is written.
  const liveSize = (live?.text.length ?? 0) + (live?.steps.length ?? 0) + (live?.actions.length ?? 0)
  useEffect(() => {
    if (!open || view !== 'chat') return
    const toEnd = () => {
      const box = scrollRef.current
      if (box) box.scrollTop = box.scrollHeight
    }
    toEnd()
    // Opening, the panel mounts as it slides in and the cards settle after: once more when they have.
    const frame = requestAnimationFrame(toEnd)
    const later = setTimeout(toEnd, 350)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(later)
    }
  }, [open, view, messages.length, liveSize, assistant.loading])

  // Ready to type as soon as it opens.
  useEffect(() => {
    if (open && view === 'chat') requestAnimationFrame(() => inputRef.current?.focus())
  }, [open, view, assistant.conversationId])

  // The box grows with the question, up to a limit.
  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }, [draft])

  const close = () => onOpenChange(false)

  const submit = () => {
    if (!draft.trim() || streaming) return
    void assistant.send(draft)
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  const suggest = (suggestion: AssistantSuggestion) => {
    if (!suggestion.fill) {
      void assistant.send(suggestion.label)
      return
    }
    setDraft(suggestion.fill)
    requestAnimationFrame(() => {
      const input = inputRef.current
      input?.focus()
      input?.setSelectionRange(input.value.length, input.value.length)
    })
  }

  const startNew = () => {
    assistant.open(null)
    setView('chat')
    setDraft('')
  }

  const firstName = profile?.name?.trim().split(/\s+/)[0]
  const turnProps = {
    busyActions: assistant.busyActions,
    onConfirm: assistant.confirm,
    onCancel: assistant.cancel,
    onUndo: streaming ? undefined : (id: number) => void assistant.send(`Deshacé el cambio de la propuesta #${id}`),
    onNavigate: close,
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[460px]"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <SheetHeader className="flex-row items-center gap-2.5 space-y-0 border-b border-line px-4 py-3 pr-12">
          {view === 'history' ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setView('chat')}
              className="-ml-1.5 size-8 text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Volver a la conversación</span>
            </Button>
          ) : (
            <AssistantLogo size={28} thinking={streaming} />
          )}
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate font-display text-[15px] tracking-[-0.01em] text-ink">
              {view === 'history' ? 'Conversaciones' : 'Asistente'}
            </SheetTitle>
            <SheetDescription className="truncate text-[12px]">
              {view === 'history'
                ? 'Retomá una conversación anterior.'
                : (assistant.title ?? 'Consulta tus datos, te guía y prepara cambios.')}
            </SheetDescription>
          </div>
          {plan.included && view === 'chat' && (
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setView('history')}
                disabled={streaming}
                className="size-8 text-muted-foreground"
                title="Conversaciones anteriores"
              >
                <History className="size-4" />
                <span className="sr-only">Conversaciones anteriores</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={startNew}
                disabled={streaming || empty}
                className="size-8 text-muted-foreground"
                title="Nueva conversación"
              >
                <SquarePen className="size-4" />
                <span className="sr-only">Nueva conversación</span>
              </Button>
            </div>
          )}
        </SheetHeader>

        {!plan.included ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <Lock className="size-5 text-faint" />
            <p className="text-[14px] font-medium text-ink">
              {plan.byRole ? 'Tu usuario no tiene habilitado el asistente' : 'Tu plan no incluye el asistente con IA'}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {plan.byRole
                ? 'Lo define el soporte de la plataforma.'
                : plan.availableIn
                  ? `Está desde el plan ${plan.availableIn}. El plan de cada número se elige en Facturación.`
                  : 'El plan de cada número se elige en Facturación.'}
            </p>
          </div>
        ) : view === 'history' ? (
          <AssistantHistory
            currentId={assistant.conversationId}
            onOpen={id => {
              assistant.open(id)
              setView('chat')
            }}
            onRemove={assistant.remove}
          />
        ) : (
          <>
            <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {assistant.loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : empty ? (
                <EmptyState firstName={firstName} route={route} onSuggest={suggest} />
              ) : (
                <div className="flex flex-col gap-5 px-4 py-5">
                  {messages.map(message =>
                    message.role === 'user' ? (
                      <UserBubble key={message.id} content={message.content} />
                    ) : (
                      <AssistantTurn
                        key={message.id}
                        content={message.content}
                        steps={savedSteps(message)}
                        actions={message.actions}
                        {...turnProps}
                      />
                    ),
                  )}
                  {live && (
                    <>
                      <UserBubble content={live.question} />
                      <AssistantTurn
                        content={live.text}
                        steps={live.steps}
                        actions={live.actions}
                        live={live.streaming}
                        {...turnProps}
                        footer={
                          live.error ? (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                              <AlertCircle className="mt-0.5 size-4 shrink-0" />
                              <div className="flex flex-1 flex-col gap-1.5">
                                <span>{live.error}</span>
                                <button
                                  type="button"
                                  onClick={assistant.retry}
                                  className="self-start font-medium underline underline-offset-2"
                                >
                                  Reintentar
                                </button>
                              </div>
                            </div>
                          ) : live.stopped ? (
                            <p className="text-[12px] text-faint">
                              Respuesta detenida.{' '}
                              <button type="button" onClick={assistant.retry} className="underline underline-offset-2">
                                Preguntar de nuevo
                              </button>
                            </p>
                          ) : null
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <form
              className="border-t border-line p-3"
              onSubmit={event => {
                event.preventDefault()
                submit()
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl border border-line-2 bg-background px-3 py-2 transition-colors focus-within:border-ember focus-within:ring-3 focus-within:ring-ember-ring/40">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={event => setDraft(event.target.value.slice(0, MAX_QUESTION))}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={MAX_QUESTION}
                  placeholder="Preguntá o pedí un cambio…"
                  aria-label="Mensaje para el asistente"
                  className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-[13.5px] leading-relaxed text-ink placeholder:text-faint focus-visible:outline-none"
                />
                {streaming ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={assistant.stop}
                    className="size-8 shrink-0 rounded-full"
                  >
                    <Square className="size-3 fill-current" />
                    <span className="sr-only">Detener la respuesta</span>
                  </Button>
                ) : (
                  <Button type="submit" size="icon" disabled={!draft.trim()} className="size-8 shrink-0 rounded-full">
                    <ArrowUp className="size-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                )}
              </div>
              <p className="mt-1.5 px-1 text-[11px] text-faint">
                Antes de cambiar algo te muestra una tarjeta para confirmar. Puede equivocarse: revisá los datos.
              </p>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function EmptyState({
  firstName,
  route,
  onSuggest,
}: {
  firstName?: string
  route?: string
  onSuggest: (suggestion: AssistantSuggestion) => void
}) {
  const reduced = useReducedMotion()
  return (
    <div className="flex flex-1 flex-col justify-center px-5 py-8">
      <div className="flex flex-col items-center text-center">
        <AssistantLogo size={52} halo />
        <h3 className="mt-5 font-display text-[20px] tracking-[-0.02em] text-ink">
          {firstName ? `Hola, ${firstName}` : 'Hola'}
        </h3>
        <p className="mt-1.5 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
          Consulto tus datos, te explico el panel y preparo cambios para que los confirmes con un toque.
        </p>
      </div>
      <div className="mt-7 flex flex-col gap-2">
        {suggestionsFor(route).map((suggestion, i) => (
          <motion.button
            key={suggestion.label}
            type="button"
            onClick={() => onSuggest(suggestion)}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.2 }}
            className={cn(
              'group flex items-center gap-3 rounded-xl border border-line-2 bg-background px-3 py-2.5 text-left text-[13px] text-ink-2',
              'transition-colors hover:border-ember-ring hover:bg-ember-soft hover:text-ink',
            )}
          >
            <suggestion.icon className="size-4 shrink-0 text-ember-2" />
            <span className="flex-1">{suggestion.label}</span>
            <ArrowRight className="size-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
