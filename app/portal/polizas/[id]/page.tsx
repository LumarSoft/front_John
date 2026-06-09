import type { Metadata } from 'next'
import { PolizaDetailView } from '@/src/features/portal/components/poliza-detail'

export const metadata: Metadata = {
  title: 'Detalle de póliza · John Pellegrini & Asoc.',
}

export default async function PolizaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PolizaDetailView id={Number(id)} />
}
