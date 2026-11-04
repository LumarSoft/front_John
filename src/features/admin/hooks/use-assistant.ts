import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from '@/src/lib/api-client'
import { assistantService } from '@/src/services/assistant.service'
import type { AssistantMessage } from '@/src/types/api/assistant'
import { useAuth } from '../context/auth-context'
import { useProfile } from './use-profile'

/** How much of the conversation goes with each question (the API takes at most 20). */
const HISTORY = 20

const storageKey = (userId: number) => `assistant:conversation:${userId}`

function readConversation(userId: number | null): AssistantMessage[] {
  if (userId === null) return []
  try {
    const raw = sessionStorage.getItem(storageKey(userId))
    const data: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(data)
      ? data.filter(
          (m): m is AssistantMessage =>
            !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
        )
      : []
  } catch {
    return []
  }
}

function writeConversation(userId: number, messages: AssistantMessage[]) {
  try {
    if (messages.length) sessionStorage.setItem(storageKey(userId), JSON.stringify(messages))
    else sessionStorage.removeItem(storageKey(userId))
  } catch {
    // Private mode or storage blocked: the conversation just does not survive a reload.
  }
}

function errorText(error: unknown): string {
  return error instanceof ApiError && error.status !== 401
    ? error.message
    : 'No se pudo hablar con el asistente. Probá de nuevo en un rato.'
}

/**
 * The conversation with the AI assistant: kept per user in the browser
 * session, so it survives moving between sections. A question that fails
 * stays in the list with its error, ready to retry.
 */
export function useAssistant() {
  const { token } = useAuth()
  const { data: profile } = useProfile()
  const userId = profile?.id ?? null
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The saved conversation of whoever is signed in (another user's never shows).
  if (userId !== loadedFor) {
    setLoadedFor(userId)
    setMessages(readConversation(userId))
    setError(null)
  }

  useEffect(() => {
    if (userId !== null && loadedFor === userId) writeConversation(userId, messages)
  }, [userId, loadedFor, messages])

  const ask = useMutation({
    mutationFn: (conversation: AssistantMessage[]) =>
      assistantService.ask(token as string, { messages: conversation.slice(-HISTORY) }),
  })

  const run = (conversation: AssistantMessage[]) => {
    setError(null)
    ask.mutate(conversation, {
      onSuccess: ({ reply }) => setMessages([...conversation, { role: 'assistant', content: reply }]),
      onError: failure => setError(errorText(failure)),
    })
  }

  const send = (text: string) => {
    const question = text.trim()
    if (!question || ask.isPending) return
    const conversation: AssistantMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(conversation)
    run(conversation)
  }

  /** Asks the last question again, after an error. */
  const retry = () => {
    if (!ask.isPending && messages.at(-1)?.role === 'user') run(messages)
  }

  const reset = () => {
    if (ask.isPending) return
    setMessages([])
    setError(null)
  }

  return { messages, send, retry, reset, pending: ask.isPending, error }
}
