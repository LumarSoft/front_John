import type { Metadata } from 'next'
import { PortalDashboard } from '@/src/features/portal/components/portal-dashboard'

export const metadata: Metadata = {
  title: 'Mis bienes · John Pellegrini & Asoc.',
}

export default function DashboardPage() {
  return <PortalDashboard />
}
