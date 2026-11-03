/** Every external service the Status section reports, in its order. */
export type IntegrationComponentKey =
  | 'triunfo.getTokenRest'
  | 'triunfo.RESTCotizadorAutV2'
  | 'triunfo.RESTDocumentosV2'
  | 'triunfo.documentDownload'
  | 'triunfo.RESTNovedadesCartera'
  | 'infoauto.cars'
  | 'infoauto.motorcycles'

/** operational = the latest call worked; failing = an incident is open; unknown = never called yet. */
export type IntegrationState = 'operational' | 'failing' | 'unknown'

export type IntegrationFailureKind =
  | 'CREDENTIALS_REJECTED'
  | 'UNEXPECTED_RESPONSE'
  | 'HTTP_ERROR'
  | 'TIMEOUT'
  | 'NETWORK'

/** Whose fault an incident is, as the AI model reads it: the provider's side, the platform's, or unknown. */
export type IntegrationBlame = 'PROVIDER' | 'PLATFORM' | 'UNKNOWN'

/** What the AI model says is failing and whose fault it is. */
export interface IncidentExplanation {
  text: string
  blame: IntegrationBlame
  /** "Triunfo: dio de baja o movió esta dirección sin avisar" */
  blameReason: string
  at: string
}

/** A stretch of time a service failed: from its first failed call to the next one that worked. */
export interface IntegrationIncident {
  id: number
  key: IntegrationComponentKey
  kind: IntegrationFailureKind
  httpStatus: number | null
  message: string
  /** What the service's error page says, in its own words. */
  answer: string | null
  /** The raw answer, for the OWNER only. */
  sample?: string | null
  failures: number
  startedAt: string
  lastFailureAt: string
  endedAt: string | null
  /** Null until the AI model answers (or without an OpenAI key). */
  explanation: IncidentExplanation | null
}

export interface IntegrationComponent {
  key: IntegrationComponentKey
  status: IntegrationState
  lastSuccessAt: string | null
  lastFailureAt: string | null
  incident: IntegrationIncident | null
}

/** An organization's own Triunfo user. */
export interface TriunfoAccess {
  producerId: number
  producerName: string
  /** Whether the organization uses Triunfo at all. */
  configured: boolean
  failingSince: string | null
  failureMessage: string | null
}

export interface WhatsappNumberStatus {
  id: number
  number: string
  producerName: string
  status: Exclude<IntegrationState, 'unknown'>
  disconnectedAt: string | null
  disconnectReason: string | null
  tokenExpiresAt: string | null
}

export interface StatusOverview {
  checkedAt: string
  components: IntegrationComponent[]
  /** The user's organization; for the OWNER, the organizations whose credentials Triunfo refuses. */
  triunfoAccess: TriunfoAccess[]
  whatsapp: WhatsappNumberStatus[]
  /** The latest incidents of the last 30 days, open ones included. */
  incidents: IntegrationIncident[]
}
