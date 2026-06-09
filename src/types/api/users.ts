export interface CreateUserRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
}
