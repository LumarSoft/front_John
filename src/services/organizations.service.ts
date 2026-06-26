import { apiRequest } from '@/src/lib/api-client'
import type {
  CreateOrganizationRequest,
  CreateProducerCodeRequest,
  CreateSuperAdminRequest,
  OrganizationCode,
  OrganizationDetail,
  OrganizationSummary,
  OrganizationUser,
  UpdateProducerCodeRequest,
} from '@/src/types/api/organizations'

export const organizationsService = {
  list: (token: string): Promise<OrganizationSummary[]> =>
    apiRequest<OrganizationSummary[]>('/owner/organizations', { token }),

  detail: (token: string, id: number): Promise<OrganizationDetail> =>
    apiRequest<OrganizationDetail>(`/owner/organizations/${id}`, { token }),

  create: (token: string, data: CreateOrganizationRequest): Promise<OrganizationDetail> =>
    apiRequest<OrganizationDetail>('/owner/organizations', { method: 'POST', token, body: data }),

  setActive: (token: string, id: number, isActive: boolean): Promise<{ id: number; isActive: boolean }> =>
    apiRequest<{ id: number; isActive: boolean }>(`/owner/organizations/${id}`, {
      method: 'PATCH',
      token,
      body: { isActive },
    }),

  addCode: (token: string, id: number, data: CreateProducerCodeRequest): Promise<OrganizationCode> =>
    apiRequest<OrganizationCode>(`/owner/organizations/${id}/codes`, { method: 'POST', token, body: data }),

  updateCode: (token: string, id: number, codeId: number, data: UpdateProducerCodeRequest): Promise<OrganizationCode> =>
    apiRequest<OrganizationCode>(`/owner/organizations/${id}/codes/${codeId}`, {
      method: 'PATCH',
      token,
      body: data,
    }),

  addSuperAdmin: (token: string, id: number, data: CreateSuperAdminRequest): Promise<OrganizationUser> =>
    apiRequest<OrganizationUser>(`/owner/organizations/${id}/superadmins`, { method: 'POST', token, body: data }),
}
