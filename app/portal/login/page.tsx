import type { Metadata } from 'next'
import { LoginForm } from '@/src/features/portal-auth/components/login-form'

export const metadata: Metadata = {
  title: 'Área cliente · John Pellegrini & Asoc.',
}

export default function PortalLoginPage() {
  return <LoginForm />
}
