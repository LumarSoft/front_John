import type { Metadata } from 'next'
import { Toaster } from '@/src/components/ui/sonner'
import { AuthProvider } from '@/src/features/admin/context/auth-context'

export const metadata: Metadata = {
  title: 'Panel de administración · John Pellegrini',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  )
}
