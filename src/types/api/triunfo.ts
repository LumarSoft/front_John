/** An organization's own Triunfo web-service access, as the owner sees it (never the password). */
export interface TriunfoCredentialStatus {
  configured: boolean
  productor: string | null
  username: string | null
  verifiedAt: string | null
  /** No credentials of its own, but the default organization runs on the server's TRIUNFO_* settings. */
  usesDefaultSettings: boolean
}

export interface SaveTriunfoCredentialRequest {
  productor: string
  username: string
  password: string
}
