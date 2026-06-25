import type { CreateLeadRequest, CreateLeadResponse } from '@/src/types/api/leads'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const leadsService = {
  create: async (data: CreateLeadRequest): Promise<CreateLeadResponse> => {
    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Lead error: ${res.status}`)
    return res.json() as Promise<CreateLeadResponse>
  },
}
