/** An organization's own Triunfo web-service access, as the owner sees it (never the password). */
export interface TriunfoCredentialStatus {
  configured: boolean
  productor: string | null
  username: string | null
  verifiedAt: string | null
  /** No credentials of its own, but the default organization runs on the server's TRIUNFO_* settings. */
  usesDefaultSettings: boolean
  /** Since when Triunfo refuses the credentials in use (own or TRIUNFO_*); null while it accepts them. */
  failingSince: string | null
  /** What Triunfo answered when it refused them. */
  failureMessage: string | null
}

/** Whether Triunfo accepts the organization's credentials, as the office's panel sees it. */
export interface TriunfoAuthState {
  failingSince: string | null
  failureMessage: string | null
}

export type TriunfoErrorKind =
  | 'CREDENTIALS_REJECTED'
  | 'REJECTED'
  | 'UNEXPECTED_RESPONSE'
  | 'HTTP_ERROR'
  | 'TIMEOUT'
  | 'NETWORK'

/** One distinct failed call to Triunfo, with how many times it happened. */
export interface TriunfoErrorRow {
  id: number
  operation: string
  kind: TriunfoErrorKind
  httpStatus: number | null
  message: string
  /** The latest answer behind it (an HTML page, an unexpected JSON), cut short. */
  sample: string | null
  occurrences: number
  firstSeenAt: string
  lastSeenAt: string
}

export interface SaveTriunfoCredentialRequest {
  productor: string
  username: string
  password: string
}
