import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ownerTriunfoService } from '@/src/services/owner-triunfo.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { SaveTriunfoCredentialRequest } from '@/src/types/api/triunfo'
import { useAuth } from '../context/auth-context'

/** OWNER: an organization's own Triunfo credentials (status only, never the password). */
export function useOrganizationTriunfo(organizationId: number) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.organizationTriunfo(organizationId),
    queryFn: () => ownerTriunfoService.status(token as string, organizationId),
    enabled: !!token,
  })
}

export function useOrganizationTriunfoActions(organizationId: number) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const key = QUERY_KEYS.owner.organizationTriunfo(organizationId)

  const save = useMutation({
    mutationFn: (data: SaveTriunfoCredentialRequest) => ownerTriunfoService.save(token as string, organizationId, data),
    onSuccess: status => queryClient.setQueryData(key, status),
  })
  const remove = useMutation({
    mutationFn: () => ownerTriunfoService.remove(token as string, organizationId),
    onSuccess: status => queryClient.setQueryData(key, status),
  })

  return { save, remove }
}
