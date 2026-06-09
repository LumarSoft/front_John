import type { Metadata } from 'next'
import { ChangePasswordForm } from '@/src/features/portal-auth/components/change-password-form'

export const metadata: Metadata = {
  title: 'Cambiar contraseña · John Pellegrini & Asoc.',
}

export default function ChangePasswordPage() {
  return <ChangePasswordForm />
}
