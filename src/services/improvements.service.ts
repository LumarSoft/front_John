import { apiRequest } from '@/src/lib/api-client'
import type {
  ImprovementRequest,
  ImprovementsListPage,
  ImprovementsPage,
  ImprovementsQuery,
  ImprovementsVisit,
  OwnerImprovement,
  OwnerImprovementsPage,
  OwnerImprovementsQuery,
  OwnerProposal,
  OwnerProposalsPage,
  OwnerProposalsQuery,
  PageQuery,
  Proposal,
  ProposalRequest,
  ProposalUpdate,
} from '@/src/types/api/improvements'

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  return `?${search.toString()}`
}

export const improvementsService = {
  list: (token: string, query: ImprovementsQuery) =>
    apiRequest<ImprovementsPage>(`/admin/improvements${toQueryString({ ...query })}`, { token }),
  unseenCount: (token: string) => apiRequest<{ count: number }>('/admin/improvements/unseen-count', { token }),
  visit: (token: string) => apiRequest<ImprovementsVisit>('/admin/improvements/visit', { method: 'POST', token }),

  ownerList: (token: string, query: OwnerImprovementsQuery) =>
    apiRequest<OwnerImprovementsPage>(`/owner/improvements${toQueryString({ ...query })}`, { token }),
  create: (token: string, data: ImprovementRequest) =>
    apiRequest<OwnerImprovement>('/owner/improvements', { method: 'POST', token, body: data }),
  update: (token: string, id: number, data: Partial<ImprovementRequest>) =>
    apiRequest<OwnerImprovement>(`/owner/improvements/${id}`, { method: 'PATCH', token, body: data }),
  remove: (token: string, id: number) =>
    apiRequest<{ ok: true }>(`/owner/improvements/${id}`, { method: 'DELETE', token }),

  proposals: (token: string, query: PageQuery) =>
    apiRequest<ImprovementsListPage<Proposal>>(`/admin/improvement-proposals${toQueryString({ ...query })}`, {
      token,
    }),
  propose: (token: string, data: ProposalRequest) =>
    apiRequest<Proposal>('/admin/improvement-proposals', { method: 'POST', token, body: data }),

  ownerProposals: (token: string, query: OwnerProposalsQuery) =>
    apiRequest<OwnerProposalsPage>(`/owner/improvement-proposals${toQueryString({ ...query })}`, { token }),
  newProposalsCount: (token: string) =>
    apiRequest<{ count: number }>('/owner/improvement-proposals/new-count', { token }),
  updateProposal: (token: string, id: number, data: ProposalUpdate) =>
    apiRequest<OwnerProposal>(`/owner/improvement-proposals/${id}`, { method: 'PATCH', token, body: data }),
}
