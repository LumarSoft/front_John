export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE'
export type TaskView = 'mine' | 'created' | 'all'

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  DONE: 'Hecha',
}

export interface TaskPerson {
  id: number
  name: string | null
  email: string
}

export interface TaskComment {
  id: number
  body: string
  createdAt: string
  user: TaskPerson
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  /** ISO date at UTC midnight: the day, without time. */
  dueDate: string | null
  contactName: string | null
  contactPhone: string | null
  /** Null while the assignee hasn't seen it (or there's a reply they haven't seen). */
  seenAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: TaskPerson
  assignedTo: TaskPerson
  comments: TaskComment[]
}

export interface TasksQuery {
  view: TaskView
  status: 'open' | 'done'
}

export interface TaskStats {
  open: number
  unseen: number
}

export interface SaveTaskRequest {
  title: string
  description?: string
  assignedToUserId: number
  /** YYYY-MM-DD, or null to clear it. */
  dueDate?: string | null
  contactName?: string
  contactPhone?: string
}

export interface UpdateTaskRequest extends Partial<SaveTaskRequest> {
  status?: TaskStatus
}
