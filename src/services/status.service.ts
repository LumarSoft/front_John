import { apiRequest } from '@/src/lib/api-client'
import type { StatusOverview } from '@/src/types/api/status'

/** The Status section: how Triunfo, InfoAuto and the WhatsApp numbers are answering. */
export const statusService = {
  overview: (token: string): Promise<StatusOverview> => apiRequest<StatusOverview>('/admin/status', { token }),
}
