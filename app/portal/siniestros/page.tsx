import type { Metadata } from 'next'
import { SiniestrosList } from '@/src/features/portal/components/siniestros-list'

export const metadata: Metadata = {
  title: 'Mis siniestros · John Pellegrini & Asoc.',
}

export default function SiniestrosPage() {
  return <SiniestrosList />
}
