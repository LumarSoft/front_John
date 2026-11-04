import { apiRequest } from '@/src/lib/api-client'
import type { BalanceQuery, BalanceResponse } from '@/src/types/api/balance'

export const balanceService = {
  get: (token: string, query: BalanceQuery) => {
    const params = new URLSearchParams()
    if (query.months) params.set('months', String(query.months))
    if (query.producerCodeId) params.set('producerCodeId', String(query.producerCodeId))
    if (query.phoneNumberId) params.set('phoneNumberId', String(query.phoneNumberId))
    const qs = params.toString()
    return apiRequest<BalanceResponse>(`/admin/balance${qs ? `?${qs}` : ''}`, { token })
  },
}
