import { CalendarClock, FileClock, HousePlus, ShieldPlus, UserRoundX, type LucideIcon } from 'lucide-react'
import type { CampaignKind } from '@/src/types/api/campaigns'

export interface CampaignPage {
  kind: CampaignKind
  /** The last part of its address: /admin/campanas/<slug>. */
  slug: string
  /** Its name in the menu, the same the API gives the campaign. */
  label: string
  icon: LucideIcon
}

/** Each campaign has its own page, in this order in the menu's "Campañas" group. */
export const CAMPAIGN_PAGES: CampaignPage[] = [
  { kind: 'coverage_upgrade', slug: 'mejora-de-coberturas', label: 'Mejora de coberturas', icon: ShieldPlus },
  { kind: 'quote_followup', slug: 'cotizaciones-sin-cerrar', label: 'Cotizaciones sin cerrar', icon: FileClock },
  { kind: 'renewal', slug: 'renovaciones', label: 'Renovaciones', icon: CalendarClock },
  { kind: 'winback', slug: 'bajas-y-anulaciones', label: 'Bajas y anulaciones', icon: UserRoundX },
  { kind: 'cross_sell', slug: 'venta-cruzada', label: 'Venta cruzada', icon: HousePlus },
]

export const campaignHref = (page: CampaignPage): string => `/admin/campanas/${page.slug}`

export function campaignPageBySlug(slug: string): CampaignPage | null {
  return CAMPAIGN_PAGES.find(page => page.slug === slug) ?? null
}

export function campaignPageByKind(kind: CampaignKind): CampaignPage | null {
  return CAMPAIGN_PAGES.find(page => page.kind === kind) ?? null
}
