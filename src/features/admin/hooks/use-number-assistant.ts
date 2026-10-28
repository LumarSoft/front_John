import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { phoneNumbersService } from '@/src/services/phone-numbers.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { UpdateNumberAssistantRequest } from '@/src/types/api/phone-numbers'
import { useAuth } from '../context/auth-context'

/** A number's own assistant next to its organization's. */
export function useNumberAssistant(id: number | null) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.numberAssistant(id ?? 0),
    queryFn: () => phoneNumbersService.getAssistant(token as string, id as number),
    enabled: !!token && id !== null,
  })
}

export function useUpdateNumberAssistant(id: number) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateNumberAssistantRequest) => phoneNumbersService.updateAssistant(token as string, id, data),
    onSuccess: assistant => {
      queryClient.setQueryData(QUERY_KEYS.admin.numberAssistant(id), assistant)
      // The list shows each number's assistant name.
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })
    },
  })
}
