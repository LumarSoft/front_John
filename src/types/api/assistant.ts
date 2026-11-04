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
 * line breaks) and links like `[Juan Pérez](asegurado:123)` to a client's file.
 */
export interface AskAssistantResponse {
  reply: string
}
