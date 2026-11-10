import { redirect } from 'next/navigation'
import { CAMPAIGN_PAGES, campaignHref } from '@/src/features/admin/lib/campaign-pages'

/** Each campaign has its own page: the old "Campañas" address opens the first one. */
export default function CampanasPage() {
  redirect(campaignHref(CAMPAIGN_PAGES[0]))
}
