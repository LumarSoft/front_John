import type { Metadata } from 'next'
import { AuthProvider } from '@/src/features/admin/context/auth-context'
import { PanelThemeProvider } from '@/src/features/admin/context/panel-theme-context'
import { PanelToaster } from '@/src/features/admin/components/panel-toaster'

export const metadata: Metadata = {
  title: 'Panel de administración · John Pellegrini',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelThemeProvider>
      <AuthProvider>
        {children}
        <PanelToaster />
      </AuthProvider>
    </PanelThemeProvider>
  )
}
