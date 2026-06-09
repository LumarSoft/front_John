import type { Metadata } from 'next'
import { SiniestroForm } from '@/src/features/portal/components/siniestro-form'

export const metadata: Metadata = {
  title: 'Nueva denuncia · John Pellegrini & Asoc.',
}

export default function NuevoSiniestroPage() {
  return <SiniestroForm />
}
