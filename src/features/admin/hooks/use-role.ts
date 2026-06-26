import { useProfile } from './use-profile'

/**
 * Current admin's role, derived from the profile (/users/me).
 * `isSuperAdmin` gates org-wide management (users, code assignment).
 */
export function useRole() {
  const { data, isLoading } = useProfile()
  const role = data?.role ?? null
  return {
    role,
    isSuperAdmin: role === 'SUPERADMIN',
    isAdmin: role === 'ADMIN',
    isLoading,
  }
}
