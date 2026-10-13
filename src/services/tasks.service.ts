import { apiRequest } from '@/src/lib/api-client'
import type { SaveTaskRequest, Task, TaskPerson, TaskStats, TasksQuery, UpdateTaskRequest } from '@/src/types/api/tasks'

export const tasksService = {
  list(token: string, query: TasksQuery): Promise<Task[]> {
    const params = new URLSearchParams({ view: query.view, status: query.status })
    return apiRequest<Task[]>(`/admin/tasks?${params.toString()}`, { token })
  },

  stats(token: string): Promise<TaskStats> {
    return apiRequest<TaskStats>('/admin/tasks/stats', { token })
  },

  people(token: string): Promise<TaskPerson[]> {
    return apiRequest<TaskPerson[]>('/admin/tasks/people', { token })
  },

  markSeen(token: string): Promise<{ seen: number }> {
    return apiRequest<{ seen: number }>('/admin/tasks/seen', { method: 'POST', token })
  },

  create(token: string, data: SaveTaskRequest): Promise<Task> {
    return apiRequest<Task>('/admin/tasks', { method: 'POST', token, body: data })
  },

  update(token: string, id: number, data: UpdateTaskRequest): Promise<Task> {
    return apiRequest<Task>(`/admin/tasks/${id}`, { method: 'PATCH', token, body: data })
  },

  remove(token: string, id: number): Promise<{ ok: boolean }> {
    return apiRequest<{ ok: boolean }>(`/admin/tasks/${id}`, { method: 'DELETE', token })
  },

  comment(token: string, id: number, body: string): Promise<Task> {
    return apiRequest<Task>(`/admin/tasks/${id}/comments`, { method: 'POST', token, body: { body } })
  },
}
