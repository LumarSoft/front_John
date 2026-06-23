import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminSiniestrosService, type UpdateSiniestroInput } from '@/src/services/siniestros.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

export function useAdminSiniestro(id: number | null) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.siniestro(id ?? 0),
    queryFn: () => adminSiniestrosService.get(id as number, token as string),
    enabled: !!token && id !== null,
  })
}

export function useUpdateAdminSiniestro(id: number | null) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateSiniestroInput) => adminSiniestrosService.update(id as number, input, token as string),
    onSuccess: () => {
      // Refresh the open detail plus any list/stats so estado changes show everywhere.
      void queryClient.invalidateQueries({ queryKey: ['admin', 'siniestros'] })
    },
  })
}
