import { useQuery } from '@tanstack/react-query'
import { tasksService } from '@/src/services/tasks.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { TasksQuery } from '@/src/types/api/tasks'
import { useAuth } from '../context/auth-context'

export function useTasks(query: TasksQuery) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.tasks(query),
    queryFn: () => tasksService.list(token as string, query),
    enabled: !!token,
    // Someone may leave a task or a reply while the list is open.
    refetchInterval: 30_000,
  })
}

/** Open tasks assigned to me, for the menu badge. */
export function useTaskStats() {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.tasksStats,
    queryFn: () => tasksService.stats(token as string),
    enabled: !!token,
    refetchInterval: 20_000,
  })
}

/** People a task can be assigned to. */
export function useTaskPeople() {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.taskPeople,
    queryFn: () => tasksService.people(token as string),
    enabled: !!token,
  })
}
