import type { AdminOrganization } from '@/src/types/api/auth'

/** The organization this site belongs to: its users keep JPMG's logo and wording. */
export const HOME_ORG_SLUG = process.env.NEXT_PUBLIC_HOME_ORG_SLUG || 'john'

/** How the panel presents the organization of whoever is logged in. */
export interface PanelBrand {
  /** Shown in the sidebar and on the login. */
  name: string
  /** How the office signs a WhatsApp message it writes to a client. */
  signature: string
  /** JPMG's logo, the organization's initials, or the platform's own mark. */
  mark: 'logo' | 'initials' | 'platform'
  initials: string
}

export const HOME_BRAND: PanelBrand = {
  name: 'John Pellegrini',
  signature: 'John Pellegrini Seguros',
  mark: 'logo',
  initials: 'JP',
}

/** For hosts that serve the panel to every organization (PANEL_NEUTRAL_HOSTS). */
export const PLATFORM_BRAND: PanelBrand = {
  name: 'Asistente de seguros',
  signature: 'tu productora de seguros',
  mark: 'platform',
  initials: '',
}

/** "Seguros Norte" → "SN"; "SN" stays "SN". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

/** The user's organization once known; until then, what the host shows. */
export function brandOf(org: AdminOrganization | undefined, fallback: PanelBrand): PanelBrand {
  if (!org) return fallback
  if (org.slug === HOME_ORG_SLUG) return HOME_BRAND
  return {
    name: org.displayName,
    signature: org.displayName,
    mark: 'initials',
    initials: initialsOf(org.shortName ?? org.displayName),
  }
}
