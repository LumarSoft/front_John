import { apiRequest } from '@/src/lib/api-client'
import type {
  CreateOrganizationRequest,
  CreateProducerCodeRequest,
  CreateOrgUserRequest,
  CreateSuperAdminRequest,
  OrganizationCode,
  OrganizationDetail,
  OrganizationSummary,
  OrganizationUser,
  SetOrganizationPlanResponse,
  UpdateOrgUserRequest,
  UpdateProducerCodeRequest,
} from '@/src/types/api/organizations'

export const organizationsService = {
  list: (token: string): Promise<OrganizationSummary[]> =>
    apiRequest<OrganizationSummary[]>('/owner/organizations', { token }),

  detail: (token: string, id: number): Promise<OrganizationDetail> =>
    apiRequest<OrganizationDetail>(`/owner/organizations/${id}`, { token }),

  uploadLogo: (token: string, id: number, file: File): Promise<{ logoUrl: string }> => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest<{ logoUrl: string }>(`/owner/organizations/${id}/logo`, { method: 'POST', token, body })
  },

  removeLogo: (token: string, id: number): Promise<{ logoUrl: null }> =>
    apiRequest<{ logoUrl: null }>(`/owner/organizations/${id}/logo`, { method: 'DELETE', token }),

  create: (token: string, data: CreateOrganizationRequest): Promise<OrganizationDetail> =>
    apiRequest<OrganizationDetail>('/owner/organizations', { method: 'POST', token, body: data }),

  setActive: (token: string, id: number, isActive: boolean): Promise<{ id: number; isActive: boolean }> =>
    apiRequest<{ id: number; isActive: boolean }>(`/owner/organizations/${id}`, {
      method: 'PATCH',
      token,
      body: { isActive },
    }),

  /** The plan the organization has with no number and its new numbers start on; null = automatic. */
  setPlan: (token: string, id: number, planId: number | null): Promise<SetOrganizationPlanResponse> =>
    apiRequest<SetOrganizationPlanResponse>(`/owner/organizations/${id}/plan`, {
      method: 'PATCH',
      token,
      body: { planId },
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

  addUser: (token: string, id: number, data: CreateOrgUserRequest): Promise<OrganizationUser> =>
    apiRequest<OrganizationUser>(`/owner/organizations/${id}/users`, { method: 'POST', token, body: data }),

  updateUser: (token: string, id: number, userId: number, data: UpdateOrgUserRequest): Promise<OrganizationUser> =>
    apiRequest<OrganizationUser>(`/owner/organizations/${id}/users/${userId}`, { method: 'PATCH', token, body: data }),

  removeUser: (token: string, id: number, userId: number): Promise<{ id: number; deleted: boolean }> =>
    apiRequest<{ id: number; deleted: boolean }>(`/owner/organizations/${id}/users/${userId}`, {
      method: 'DELETE',
      token,
    }),
}
