export type AdminRole = 'OWNER' | 'SUPERADMIN' | 'ADMIN'

export interface AdminUserProducerCode {
  producerCode: { id: number; code: string; holderName: string | null }
}

/** The organization a user belongs to, as the panel names it. */
export interface AdminOrganization {
  slug: string
  name: string
  /** The name the bot uses for it ("John Pellegrini Management Group"), or `name`. */
  displayName: string
  shortName: string | null
  /**
   * The office line (the active number billed to the master code): the SuperAdmin's
   * sections open filtered by it. Absent on older APIs.
   */
  defaultPhoneNumber?: { id: number; number: string } | null
}

export interface AdminUser {
  id: number
  email: string
  /** How the office calls this person ("Mili"); null = show the email. */
  name?: string | null
  role: AdminRole
  producerId: number
  // Codes this admin can access (empty for SUPERADMIN = all). Present on /users/me and /users.
  producerCodes?: AdminUserProducerCode[]
  /** Present on /users/me. Absent on older APIs. */
  organization?: AdminOrganization
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
  name?: string
  password?: string
}
