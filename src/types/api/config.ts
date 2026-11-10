export interface ProducerConfig {
  /** Bot display name; null means the bot uses the generic fallback. */
  botName: string | null
  /** Office people customers write to by name; their messages go to the office. Absent on older APIs. */
  staffNames?: string[]
}

export interface UpdateConfigRequest {
  /** Empty string clears the name (the bot introduces itself as "el asistente de <org>"). */
  botName?: string
  /** Empty list clears the names. */
  staffNames?: string[]
}

/** The only transfer mode: the bot gives no account and the office passes the data. */
export const TRANSFER_BY_OFFICE = 'office'
export type TransferMode = typeof TRANSFER_BY_OFFICE

/**
 * What the bot says that is particular to the organization (GET /admin/config/profile).
 * A field never configured is null.
 */
export interface BotProfile {
  /** How the bot names the organization ("Seguros del Litoral"). */
  orgName: string | null
  orgShortName: string | null
  orgLegalName: string | null
  towTruckPhone: string | null
  /** Null → the bot gives Triunfo's claims line. */
  claimsPhone: string | null
  /** Null → "Rapipago o Pago Fácil". */
  cashPaymentPlaces: string | null
  /**
   * 'office': the bot gives no account, the office passes the data in the chat
   * (the account fields are then null). Null: the account below, or a number's
   * organization's. Absent on older APIs.
   */
  transferMode?: TransferMode | null
  transferAlias: string | null
  transferCbu: string | null
  transferHolder: string | null
  transferBank: string | null
  /** Who gets the e-mail of each new claim. */
  claimsEmail: string | null
  /** The line the bot adds at the end of every quote it gives. Null → the quote ends as is. */
  quoteClosingNote: string | null
}

/** Only the fields sent change; an empty string clears one. */
export type UpdateBotProfileRequest = Partial<Record<keyof BotProfile, string>>
