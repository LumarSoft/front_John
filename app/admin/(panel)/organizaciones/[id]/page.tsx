import { OrganizacionDetalleView } from '@/src/features/admin/components/organizacion-detalle-view'

export default async function AdminOrganizacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OrganizacionDetalleView orgId={Number(id)} />
}
