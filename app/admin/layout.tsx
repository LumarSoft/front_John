import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Toaster } from '@/src/components/ui/sonner'
import { AuthProvider } from '@/src/features/admin/context/auth-context'
import { PanelBrandProvider } from '@/src/features/admin/context/panel-brand-context'
import { isNeutralPanelHost } from '@/src/lib/panel-host'

// The panel serves every organization: on a host listed in PANEL_NEUTRAL_HOSTS
// it shows the platform's brand instead of JPMG's (whose site this is).
async function onNeutralHost(): Promise<boolean> {
  return isNeutralPanelHost((await headers()).get('host'))
}

export async function generateMetadata(): Promise<Metadata> {
  if (await onNeutralHost()) {
    return {
      title: 'Panel de administración',
      description: 'Panel de gestión del asistente de WhatsApp para productores de seguros.',
      icons: { icon: '/panel-icon.svg', apple: '/panel-icon.svg' },
      robots: { index: false, follow: false },
    }
  }
  return {
    title: 'Panel de administración · John Pellegrini',
    robots: { index: false, follow: false },
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const neutral = await onNeutralHost()
  return (
    <AuthProvider>
      <PanelBrandProvider neutral={neutral}>{children}</PanelBrandProvider>
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  )
}
