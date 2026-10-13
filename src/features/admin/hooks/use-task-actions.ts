import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksService } from '@/src/services/tasks.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { SaveTaskRequest, UpdateTaskRequest } from '@/src/types/api/tasks'
import { useAuth } from '../context/auth-context'

export function useTaskActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tasksAll })
  }

  const create = useMutation({
    mutationFn: (data: SaveTaskRequest) => tasksService.create(token as string, data),
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) =>
      tasksService.update(token as string, id, data),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: number) => tasksService.remove(token as string, id),
    onSuccess: refresh,
  })

  const comment = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => tasksService.comment(token as string, id, body),
    onSuccess: refresh,
  })

  const markSeen = useMutation({
    mutationFn: () => tasksService.markSeen(token as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tasksStats })
    },
  })

  return { create, update, remove, comment, markSeen }
}
