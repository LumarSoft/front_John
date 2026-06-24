import { useMutation, useQueryClient } from '@tanstack/react-query'
import { solicitudesService } from '@/src/services/solicitudes.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { SolicitudKind, UpdateSolicitudRequest } from '@/src/types/api/solicitudes'
import { useAuth } from '../context/auth-context'

interface UpdateVariables {
  kind: SolicitudKind
  id: number
  data: UpdateSolicitudRequest
}

export function useSolicitudActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const update = useMutation({
    mutationFn: ({ kind, id, data }: UpdateVariables) => solicitudesService.update(kind, id, data, token as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'solicitudes'] })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.dashboard })
    },
  })

  return { update }
}
