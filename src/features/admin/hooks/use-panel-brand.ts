import { brandOf, type PanelBrand } from '../lib/org-brand'
import { useProfile } from './use-profile'

/** The logged-in user's organization as the panel presents it (the site's brand until the profile loads). */
export function usePanelBrand(): PanelBrand {
  const { data: profile } = useProfile()
  return brandOf(profile?.organization, profile?.role)
}
