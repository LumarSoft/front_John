import { useMutation, useQueryClient } from '@tanstack/react-query'
import { novedadesService } from '@/src/services/novedades.service'
import type { NovedadType } from '@/src/types/api/novedades'
import { useAuth } from '../context/auth-context'

export function useNovedadesActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'novedades'] })
  }

  const markRead = useMutation({
    mutationFn: (id: number) => novedadesService.markRead(id, token as string),
    onSuccess: invalidate,
  })

  const markAllRead = useMutation({
    mutationFn: (type: NovedadType | undefined) => novedadesService.markAllRead(type, token as string),
    onSuccess: invalidate,
  })

  return { markRead, markAllRead }
}
