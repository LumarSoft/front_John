export interface ProducerConfig {
  /** Bot display name; null means the bot uses the generic fallback. */
  botName: string | null
}

export interface UpdateConfigRequest {
  /** Empty string clears the name (bot falls back to "el asistente de JPMG"). */
  botName?: string
}
