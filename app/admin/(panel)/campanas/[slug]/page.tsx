import { redirect } from 'next/navigation'
import { CampaignView } from '@/src/features/admin/components/campaign-view'
import { CAMPAIGN_PAGES, campaignHref, campaignPageBySlug } from '@/src/features/admin/lib/campaign-pages'

export default async function CampanaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = campaignPageBySlug(slug)
  if (!page) redirect(campaignHref(CAMPAIGN_PAGES[0]))
  return <CampaignView key={page.kind} kind={page.kind} />
}
