import { apiRequest } from '@/src/lib/api-client'
import type { SaveTriunfoCredentialRequest, TriunfoAuthState, TriunfoCredentialStatus } from '@/src/types/api/triunfo'

/** The office's Triunfo connection: whether it accepts the organization's credentials, and its own access. */
export const triunfoService = {
  status: (token: string): Promise<TriunfoAuthState> =>
    apiRequest<TriunfoAuthState>('/admin/triunfo/status', { token }),

  /** SUPERADMIN: the access of its own organization (never the password). */
  credential: (token: string): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>('/admin/triunfo/credential', { token }),

  saveCredential: (token: string, data: SaveTriunfoCredentialRequest): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>('/admin/triunfo/credential', { method: 'PUT', token, body: data }),
}
