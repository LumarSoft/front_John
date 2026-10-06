import { useMutation, useQueryClient } from '@tanstack/react-query'
import { novedadesService } from '@/src/services/novedades.service'
import type { NovedadType, MatterCategory, MatterStatus } from '@/src/types/api/novedades'
import { useAuth } from '../context/auth-context'

export function useNovedadesActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'novedades'] })
  }

  const clearAll = useMutation({
    mutationFn: () => novedadesService.clearAll(token as string),
    onSuccess: invalidate,
  })

  const markRead = useMutation({
    mutationFn: (id: number) => novedadesService.markRead(id, token as string),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: (type: NovedadType | undefined) => novedadesService.markAllRead(type, token as string),
    onSuccess: invalidate,
  })

  const updateMatter = useMutation({
    mutationFn: ({ id, ...changes }: { id: number; category?: MatterCategory; status?: MatterStatus }) =>
      novedadesService.updateMatter(id, changes, token as string),
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'solicitudes'] })
    },
  })
  return { markRead, markAllRead, updateMatter, clearAll }
}
