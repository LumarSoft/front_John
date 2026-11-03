import type { AdminOrganization, AdminRole } from '@/src/types/api/auth'

/** How the panel presents the organization of whoever is logged in. */
export interface PanelBrand {
  /** Shown in the sidebar. */
  name: string
  /** How the office signs a WhatsApp message it writes to a client; empty = unsigned. */
  signature: string
  /** The site's own mark (JPMG's logo), or the organization's: its logo when it has one, else its initials. */
  mark: 'platform' | 'initials'
  initials: string
  /** The organization's logo (API-relative URL), or null. */
  logoUrl: string | null
}

/** Before login, for the owner (Lumarsoft) and while the profile loads. */
export const PLATFORM_BRAND: PanelBrand = {
  name: 'John Pellegrini',
  signature: '',
  mark: 'platform',
  initials: 'JP',
  logoUrl: null,
}

/** "Seguros Norte" → "SN"; "ACME" → "AC". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

/** The user's organization as the panel shows it. The owner runs the platform, so it sees the site's mark. */
export function brandOf(org: AdminOrganization | undefined, role: AdminRole | undefined): PanelBrand {
  if (!org || role === 'OWNER') return PLATFORM_BRAND
  return {
    name: org.displayName,
    signature: org.displayName,
    mark: 'initials',
    initials: initialsOf(org.shortName ?? org.displayName),
    logoUrl: org.logoUrl ?? null,
  }
}
