import type { AdminRole } from './auth'

export interface CreateUserRequest {
  email: string
  password: string
  role?: AdminRole
  producerCodeIds?: number[]
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  role?: AdminRole
  producerCodeIds?: number[]
}

/** A producer code option for the user-assignment UI (GET /users/producer-codes). */
export interface ProducerCodeOption {
  id: number
  code: string
  holderName: string | null
  isMaster: boolean
  isActive: boolean
}
