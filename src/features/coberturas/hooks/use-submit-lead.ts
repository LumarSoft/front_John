import { useMutation } from '@tanstack/react-query'
import { leadsService } from '@/src/services/leads.service'
import type { CreateLeadRequest } from '@/src/types/api/leads'

export function useSubmitLead() {
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsService.create(data),
  })
}
