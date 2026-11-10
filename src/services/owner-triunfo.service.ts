import { apiRequest } from '@/src/lib/api-client'
import type { SaveTriunfoCredentialRequest, TriunfoCredentialStatus, TriunfoErrorRow } from '@/src/types/api/triunfo'

/** OWNER: each organization's own Triunfo web-service access. */
export const ownerTriunfoService = {
  status: (token: string, organizationId: number): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>(`/owner/organizations/${organizationId}/triunfo`, { token }),

  save: (token: string, organizationId: number, data: SaveTriunfoCredentialRequest): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>(`/owner/organizations/${organizationId}/triunfo`, {
      method: 'PUT',
      token,
      body: data,
    }),

  remove: (token: string, organizationId: number): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>(`/owner/organizations/${organizationId}/triunfo`, {
      method: 'DELETE',
      token,
    }),

  setQuoteFallback: (token: string, organizationId: number, enabled: boolean): Promise<TriunfoCredentialStatus> =>
    apiRequest<TriunfoCredentialStatus>(`/owner/organizations/${organizationId}/triunfo/quote-fallback`, {
      method: 'PUT',
      token,
      body: { enabled },
    }),

  errors: (token: string, organizationId: number): Promise<TriunfoErrorRow[]> =>
    apiRequest<TriunfoErrorRow[]>(`/owner/organizations/${organizationId}/triunfo/errors`, { token }),
}
