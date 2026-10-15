import { useMutation, useQuery } from '@tanstack/react-query'
import { saveBlob } from '@/src/lib/download'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { adminClientsService } from '@/src/services/admin-clients.service'
import type { AdminPolizaDetail, AdminPolizaDocumento } from '@/src/types/api/clients'
import { useAuth } from '../context/auth-context'

/** Documents Triunfo has for one of the client's policies. */
export function useAdminPolizaDocumentos(clientId: number, polizaId: number) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.clientPolizaDocumentos(clientId, polizaId),
    queryFn: () => adminClientsService.documentos(clientId, polizaId, token as string),
    enabled: !!token,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

// Same name the API gives the file ("Tarjeta verde (Mercosur) - AB123CD.pdf"): the
// browser can't read the API's Content-Disposition across origins.
function documentoFileName(doc: AdminPolizaDocumento, poliza: AdminPolizaDetail): string {
  const reference = poliza.vehicle?.licensePlate || `póliza ${poliza.certificateNumber}`
  const safe = `${doc.name} - ${reference}`
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return `${safe}.pdf`
}

/** Downloads one document of the policy as a PDF and saves it in the browser. */
export function useDownloadPolizaDocumento(clientId: number, poliza: AdminPolizaDetail) {
  const { token } = useAuth()

  return useMutation({
    mutationFn: (doc: AdminPolizaDocumento) =>
      adminClientsService.downloadDocumento(clientId, poliza.id, doc.code, token as string),
    onSuccess: (blob, doc) => saveBlob(blob, documentoFileName(doc, poliza)),
  })
}
