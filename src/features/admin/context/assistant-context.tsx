'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAssistant } from '../hooks/use-assistant'
import { usePlanFeature } from '../hooks/use-billing'
import { AssistantPanel } from '../components/assistant-panel'

interface AssistantPanelContext {
  open: boolean
  setOpen: (open: boolean) => void
  /** False when no plan has the assistant (or the person is the OWNER): no button at all. */
  available: boolean
}

const Context = createContext<AssistantPanelContext>({ open: false, setOpen: () => undefined, available: false })

interface AssistantProviderProps {
  /** Off for the OWNER, who has no portfolio to ask about. */
  enabled: boolean
  /** The screen the person is on: sent with each question. */
  route: string
  screen: string
  children: ReactNode
}

/**
 * The AI assistant for the whole panel: one conversation that carries on
 * across sections (Whatsapp included), its side panel, and ⌘K / Ctrl+K to
 * open or close it from anywhere.
 */
export function AssistantProvider({ enabled, route, screen, children }: AssistantProviderProps) {
  const [open, setOpen] = useState(false)
  const plan = usePlanFeature('ai_assistant')
  const available = enabled && !plan.nowhere
  const page = useMemo(() => ({ route, screen }), [route, screen])
  const assistant = useAssistant(page, available)

  useEffect(() => {
    if (!available) return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(current => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [available])

  const value = useMemo(() => ({ open, setOpen, available }), [open, available])

  return (
    <Context.Provider value={value}>
      {children}
      {available && (
        <AssistantPanel open={open} onOpenChange={setOpen} assistant={assistant} plan={plan} route={route} />
      )}
    </Context.Provider>
  )
}

export function useAssistantPanel(): AssistantPanelContext {
  return useContext(Context)
}
