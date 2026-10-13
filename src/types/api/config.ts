export interface ProducerConfig {
  /** Bot display name; null means the bot uses the generic fallback. */
  botName: string | null
  /** Organization-wide switch for every automated WhatsApp response. */
  botEnabled: boolean
  /** Office people customers write to by name; their messages go to the office. Absent on older APIs. */
  staffNames?: string[]
}

export interface SetBotStatusRequest {
  botEnabled: boolean
}

export interface UpdateConfigRequest {
  /** Empty string clears the name (bot falls back to "el asistente de JPMG"). */
  botName?: string
  /** Empty list clears the names. */
  staffNames?: string[]
}
