import type { Metadata } from 'next'
import { DocumentosList } from '@/src/features/portal/components/documentos-list'

export const metadata: Metadata = {
  title: 'Mis documentos · John Pellegrini & Asoc.',
}

export default function DocumentosPage() {
  return <DocumentosList />
}
