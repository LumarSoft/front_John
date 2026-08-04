import { useProfile } from './use-profile'

/**
 * Current admin's role, derived from the profile (/users/me).
 * - `isOwner` (Lumar) — its ONLY interface is the "Organizaciones" screen.
 * - `isSuperAdmin` gates org-wide management (usuarios, números, filtros).
 * The OWNER is intentionally NOT a SuperAdmin in the UI: it doesn't operate a
 * tenant's cartera, it only provisions organizations.
 */
export function useRole() {
  const { data, isLoading } = useProfile()
  const role = data?.role ?? null
  return {
    role,
    isOwner: role === 'OWNER',
    isSuperAdmin: role === 'SUPERADMIN',
    isAdmin: role === 'ADMIN',
    isLoading,
  }
}
