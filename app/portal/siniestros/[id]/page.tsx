import type { Metadata } from 'next'
import { SiniestroDetailView } from '@/src/features/portal/components/siniestro-detail'

export const metadata: Metadata = {
  title: 'Detalle de siniestro · John Pellegrini & Asoc.',
}

export default async function SiniestroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SiniestroDetailView id={Number(id)} />
}
