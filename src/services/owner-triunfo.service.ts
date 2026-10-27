import { apiRequest } from '@/src/lib/api-client'
import type { SaveTriunfoCredentialRequest, TriunfoCredentialStatus } from '@/src/types/api/triunfo'

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
}
