import { apiRequest } from '@/src/lib/api-client'
import type { Improvement, ImprovementRequest, OwnerImprovement } from '@/src/types/api/improvements'

export const improvementsService = {
  list: (token: string) => apiRequest<Improvement[]>('/admin/improvements', { token }),
  unseenCount: (token: string) => apiRequest<{ count: number }>('/admin/improvements/unseen-count', { token }),
  visit: (token: string) =>
    apiRequest<{ previousVisitAt: string | null; visitedAt: string }>('/admin/improvements/visit', {
      method: 'POST',
      token,
    }),

  ownerList: (token: string) => apiRequest<OwnerImprovement[]>('/owner/improvements', { token }),
  create: (token: string, data: ImprovementRequest) =>
    apiRequest<OwnerImprovement>('/owner/improvements', { method: 'POST', token, body: data }),
  update: (token: string, id: number, data: Partial<ImprovementRequest>) =>
    apiRequest<OwnerImprovement>(`/owner/improvements/${id}`, { method: 'PATCH', token, body: data }),
  remove: (token: string, id: number) =>
    apiRequest<{ ok: true }>(`/owner/improvements/${id}`, { method: 'DELETE', token }),
}
