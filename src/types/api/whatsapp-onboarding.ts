/** Ids the browser needs to launch Embedded Signup. Never includes the app secret. */
export interface EmbeddedSignupConfig {
  appId: string | null
  configId: string | null
  graphVersion: string
  /** False when META_APP_ID or META_ES_CONFIG_ID are missing on the API. */
  ready: boolean
}

export interface OnboardWhatsappRequest {
  code: string
  wabaId: string
  /** May be omitted by Meta's Coexistence finish event; the API resolves it. */
  phoneNumberId?: string
  number?: string
  isCoexistence?: boolean
  pin?: string
  responsibleProducerCodeId?: number
  servedCodeIds?: number[]
}

export interface OnboardWhatsappResponse {
  phoneNumberId: number
  wabaAccountId: number
  metaPhoneNumberId: string
  wabaId: string
  subscribed: boolean
  /** False when Meta rejected /register — expected on Coexistence. */
  pinSet: boolean
  historySyncRequested: boolean
  contactsSyncRequested: boolean
}
