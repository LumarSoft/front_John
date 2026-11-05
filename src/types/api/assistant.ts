/** One turn of the conversation with the AI assistant. */
export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
}

/** The whole visible conversation, oldest first (at most 20); the last message is the user's. */
export interface AskAssistantRequest {
  messages: AssistantMessage[]
}

/**
 * The assistant's answer: Spanish with light markdown (`**negrita**`, `- ` lists,
 * line breaks), links like `[Juan Pérez](asegurado:123)` to a client's file and,
 * after explaining a task, `[Mostrame en pantalla](recorrido:cargar-rechazos)` to
 * run that on-screen guide.
 */
export interface AskAssistantResponse {
  reply: string
}
