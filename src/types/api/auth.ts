export type AdminRole = 'OWNER' | 'SUPERADMIN' | 'ADMIN'

export interface AdminUserProducerCode {
  producerCode: { id: number; code: string; holderName: string | null }
}

export interface AdminUser {
  id: number
  email: string
  role: AdminRole
  producerId: number
  // Codes this admin can access (empty for SUPERADMIN = all). Present on /users/me and /users.
  producerCodes?: AdminUserProducerCode[]
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
