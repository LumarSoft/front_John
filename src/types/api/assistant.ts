/** One line of an action card: what changes, from what to what (null = empty). */
export interface AssistantActionChange {
  label: string
  before: string | null
  after: string | null
}

/** What a card shows before anyone confirms it. */
export interface AssistantActionPreview {
  title: string
  /** What it applies to: "Toda la organización", "+54 9 341 … · Centro". */
  target: string
  changes: AssistantActionChange[]
  /** Who else it reaches, warnings. */
  notes: string[]
  /** The confirm button: "Cambiar la cuenta". */
  confirmLabel: string
}

export type AssistantActionStatus = 'pending' | 'confirmed' | 'cancelled' | 'failed' | 'expired'

/**
 * A change the assistant prepared. Nothing changes until the person taps the
 * confirm button; then the API runs it with the person's own permissions.
 */
export interface AssistantAction {
  id: number
  type: string
  status: AssistantActionStatus
  /** Confirmed, and the API kept what it replaced: the card offers to undo it. */
  undoable: boolean
  preview: AssistantActionPreview
  /** Once confirmed: what was done. */
  summary: string | null
  /** Where to see it: "Ver en Configuración". */
  link: { route: string; label: string } | null
  error: string | null
  expiresAt: string
}

/**
 * A message of a saved conversation. The assistant's content is Spanish with
 * light markdown (`**negrita**`, `- ` lists, line breaks) and links the panel
 * turns into buttons: `[Juan Pérez](asegurado:123)` (a client's file),
 * `[Ir a Configuración](pantalla:configuracion)` (a screen) and
 * `[Mostrame en pantalla](recorrido:cargar-rechazos)` (an on-screen guide).
 */
export interface AssistantMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  /** The steps it took to answer ("Revisando los datos de pago"). */
  steps: string[]
  actions: AssistantAction[]
  createdAt: string
}

export interface AssistantConversationSummary {
  id: number
  title: string
  updatedAt: string
}

export interface AssistantConversation {
  id: number
  title: string
  messages: AssistantMessage[]
}

export interface SendAssistantMessageRequest {
  /** Without it, a new conversation starts. */
  conversationId?: number
  content: string
  /** The screen the person is on, so "esto" and "acá" mean something. */
  page?: { route?: string; screen?: string }
}

/** A step the assistant is taking right now. */
export interface AssistantStep {
  id: string
  label: string
  state: 'running' | 'done'
}

/** What the answer stream sends, in this order: conversation?, then step/delta/action, then done or error. */
export type AssistantStreamEvent =
  | { event: 'conversation'; data: AssistantConversationSummary }
  | { event: 'step'; data: AssistantStep }
  | { event: 'delta'; data: { text: string } }
  | { event: 'action'; data: AssistantAction }
  | { event: 'done'; data: { conversationId: number; message: AssistantMessage } }
  | { event: 'error'; data: { message: string } }

export interface ConfirmAssistantActionResponse {
  action: AssistantAction
  /** The panel caches to refresh: the second part of their keys (['admin', tag, …]). */
  refresh: string[]
}
