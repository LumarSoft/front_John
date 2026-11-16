import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { triunfoService } from '@/src/services/triunfo.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { SaveTriunfoCredentialRequest } from '@/src/types/api/triunfo'
import { useAuth } from '../context/auth-context'

/** SUPERADMIN: the Triunfo access of its own organization (status only, never the password). */
export function useTriunfoCredential(enabled: boolean) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.triunfoCredential,
    queryFn: () => triunfoService.credential(token as string),
    enabled: !!token && enabled,
  })
}

export function useSaveTriunfoCredential() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SaveTriunfoCredentialRequest) => triunfoService.saveCredential(token as string, data),
    onSuccess: status => {
      queryClient.setQueryData(QUERY_KEYS.admin.triunfoCredential, status)
      // Triunfo just accepted them: the "Triunfo refuses the credentials" banner is out of date.
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.triunfoStatus })
    },
  })
}
