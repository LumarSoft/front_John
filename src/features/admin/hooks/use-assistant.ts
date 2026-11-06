import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/src/lib/api-client'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { assistantService } from '@/src/services/assistant.service'
import type {
  AssistantAction,
  AssistantConversation,
  AssistantMessage,
  AssistantStep,
  SendAssistantMessageRequest,
} from '@/src/types/api/assistant'
import { useAuth } from '../context/auth-context'
import { useProfile } from './use-profile'

/** The answer being written, shown until it is saved and read back. */
export interface LiveTurn {
  question: string
  text: string
  steps: AssistantStep[]
  actions: AssistantAction[]
  streaming: boolean
  /** Why it stopped short: the API's message, or null when the person stopped it. */
  error: string | null
  stopped: boolean
}

const currentKey = (userId: number) => `assistant:current:${userId}`

/** The conversation open in this tab, per user, so a reload goes back to it. */
function readCurrent(userId: number | null): number | null {
  if (userId === null) return null
  try {
    const id = Number(sessionStorage.getItem(currentKey(userId)))
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

function writeCurrent(userId: number, id: number | null) {
  try {
    if (id) sessionStorage.setItem(currentKey(userId), String(id))
    else sessionStorage.removeItem(currentKey(userId))
  } catch {
    // Storage blocked: the open conversation just does not survive a reload (it stays in the history).
  }
}

export function assistantErrorText(error: unknown): string {
  return error instanceof ApiError && error.status !== 401
    ? error.message
    : 'No se pudo hablar con el asistente. Probá de nuevo en un rato.'
}

function upsertStep(steps: AssistantStep[], step: AssistantStep): AssistantStep[] {
  return steps.some(s => s.id === step.id) ? steps.map(s => (s.id === step.id ? step : s)) : [...steps, step]
}

function withAction(conversation: AssistantConversation | undefined, action: AssistantAction) {
  if (!conversation) return conversation
  return {
    ...conversation,
    messages: conversation.messages.map(m =>
      m.actions.some(a => a.id === action.id)
        ? { ...m, actions: m.actions.map(a => (a.id === action.id ? action : a)) }
        : m,
    ),
  }
}

/** The saved messages, without a trailing question the answer being written already shows. */
function settledMessages(messages: AssistantMessage[], live: LiveTurn | null): AssistantMessage[] {
  const last = messages.at(-1)
  return live && last?.role === 'user' && last.content === live.question ? messages.slice(0, -1) : messages
}

/**
 * The conversation with the AI assistant: saved in the API per person, the
 * answer streamed as it is written (with the steps it takes and the changes it
 * proposes), and the panel's screens refreshed when a change is confirmed.
 */
export function useAssistant(page: SendAssistantMessageRequest['page'], enabled = true) {
  const { token } = useAuth()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const userId = profile?.id ?? null
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [live, setLive] = useState<LiveTurn | null>(null)
  const [busyActions, setBusyActions] = useState<number[]>([])
  const abortRef = useRef<AbortController | null>(null)

  // Whoever signs in gets their own conversation back (never another user's).
  if (userId !== loadedFor) {
    setLoadedFor(userId)
    setConversationId(readCurrent(userId))
    setLive(null)
  }

  useEffect(() => {
    if (userId !== null && loadedFor === userId) writeCurrent(userId, conversationId)
  }, [userId, loadedFor, conversationId])

  const conversation = useQuery({
    queryKey: QUERY_KEYS.admin.assistantConversation(conversationId ?? 0),
    queryFn: () => assistantService.conversation(token as string, conversationId as number),
    enabled: enabled && !!token && conversationId !== null,
    staleTime: 60_000,
  })

  // A conversation that is gone (deleted, or old enough to be cleaned up): start a new one.
  if (conversationId !== null && conversation.error instanceof ApiError && conversation.error.status === 404) {
    setConversationId(null)
  }

  const streaming = live?.streaming ?? false

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || streaming || !token) return
    const controller = new AbortController()
    abortRef.current = controller
    setLive({ question, text: '', steps: [], actions: [], streaming: true, error: null, stopped: false })

    let id = conversationId
    let answer: AssistantMessage | null = null
    let failure: string | null = null
    try {
      await assistantService.send(
        token,
        { ...(id ? { conversationId: id } : {}), content: question, page },
        event => {
          switch (event.event) {
            case 'conversation':
              id = event.data.id
              queryClient.setQueryData<AssistantConversation>(QUERY_KEYS.admin.assistantConversation(id), {
                id,
                title: event.data.title,
                messages: [],
              })
              setConversationId(id)
              void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assistantConversations })
              break
            case 'step':
              setLive(l => l && { ...l, steps: upsertStep(l.steps, event.data) })
              break
            case 'delta':
              setLive(l => l && { ...l, text: l.text + event.data.text })
              break
            case 'action':
              setLive(l => l && { ...l, actions: [...l.actions, event.data] })
              break
            case 'done':
              answer = event.data.message
              break
            case 'error':
              failure = event.data.message
              break
          }
        },
        controller.signal,
      )
    } catch (error) {
      if (controller.signal.aborted) {
        setLive(l => l && { ...l, streaming: false, stopped: true })
        return
      }
      failure = assistantErrorText(error)
    } finally {
      abortRef.current = null
    }

    const saved: AssistantMessage | null = answer
    if (!saved || id === null) {
      setLive(l => l && { ...l, streaming: false, error: failure ?? 'El asistente no pudo responder. Probá de nuevo.' })
      return
    }
    // The answer joins the saved conversation right away; a refetch brings the question's real id.
    const key = QUERY_KEYS.admin.assistantConversation(id)
    queryClient.setQueryData<AssistantConversation>(key, old => {
      const base = settledMessages(old?.messages ?? [], { question } as LiveTurn)
      const asked: AssistantMessage = {
        id: -Date.now(),
        role: 'user',
        content: question,
        steps: [],
        actions: [],
        createdAt: new Date().toISOString(),
      }
      return { id: id as number, title: old?.title ?? question, messages: [...base, asked, saved] }
    })
    setLive(null)
    void queryClient.invalidateQueries({ queryKey: key })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assistantConversations })
  }

  /** Stops the answer being written (the API stops too and saves nothing). */
  const stop = () => abortRef.current?.abort()

  /** Asks the last question again, after an error. */
  const retry = () => {
    if (live && !live.streaming) void send(live.question)
  }

  const updateAction = (action: AssistantAction) => {
    if (conversationId !== null) {
      queryClient.setQueryData<AssistantConversation>(QUERY_KEYS.admin.assistantConversation(conversationId), old =>
        withAction(old, action),
      )
    }
    setLive(l => l && { ...l, actions: l.actions.map(a => (a.id === action.id ? action : a)) })
  }

  const settle = (actionId: number) => setBusyActions(ids => ids.filter(id => id !== actionId))

  const confirm = useMutation({
    mutationFn: (actionId: number) => assistantService.confirm(token as string, actionId),
    onMutate: actionId => setBusyActions(ids => [...ids, actionId]),
    onSuccess: ({ action, refresh }) => {
      updateAction(action)
      for (const tag of refresh) void queryClient.invalidateQueries({ queryKey: ['admin', tag] })
      if (action.status === 'confirmed') toast.success(action.summary ?? 'Listo.')
    },
    onError: error => {
      toast.error(assistantErrorText(error))
      // It may have expired or run in another tab: show the card as it is now.
      if (conversationId !== null) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assistantConversation(conversationId) })
      }
    },
    onSettled: (_data, _error, actionId) => settle(actionId),
  })

  const cancel = useMutation({
    mutationFn: (actionId: number) => assistantService.cancel(token as string, actionId),
    onMutate: actionId => setBusyActions(ids => [...ids, actionId]),
    onSuccess: updateAction,
    onError: error => toast.error(assistantErrorText(error)),
    onSettled: (_data, _error, actionId) => settle(actionId),
  })

  const open = (id: number | null) => {
    if (streaming) return
    setConversationId(id)
    setLive(null)
  }

  const remove = useMutation({
    mutationFn: (id: number) => assistantService.remove(token as string, id),
    onSuccess: (_data, id) => {
      if (id === conversationId) open(null)
      queryClient.removeQueries({ queryKey: QUERY_KEYS.admin.assistantConversation(id) })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.assistantConversations })
    },
    onError: error => toast.error(assistantErrorText(error)),
  })

  return {
    conversationId,
    title: conversation.data?.title ?? null,
    messages: settledMessages(conversation.data?.messages ?? [], live),
    loading: conversation.isLoading && conversationId !== null,
    live,
    streaming,
    send,
    stop,
    retry,
    confirm: (actionId: number) => confirm.mutate(actionId),
    cancel: (actionId: number) => cancel.mutate(actionId),
    busyActions,
    open,
    remove: (id: number) => remove.mutate(id),
  }
}

export type AssistantState = ReturnType<typeof useAssistant>

/** The person's past conversations, only while the history is open. */
export function useAssistantHistory(enabled: boolean) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.assistantConversations,
    queryFn: () => assistantService.conversations(token as string),
    enabled: enabled && !!token,
    staleTime: 30_000,
  })
}
