export interface AdminUser {
  id: number
  email: string
  role: string
  producerId: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface UpdateProfileRequest {
  email?: string
  password?: string
}
