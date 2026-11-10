import type { TriunfoErrorKind } from '@/src/types/api/triunfo'

export const TRIUNFO_ERROR_KIND_LABELS: Record<TriunfoErrorKind, string> = {
  CREDENTIALS_REJECTED: 'Credenciales rechazadas',
  REJECTED: 'Triunfo respondió con error',
  UNEXPECTED_RESPONSE: 'Respuesta inesperada',
  HTTP_ERROR: 'Error HTTP',
  TIMEOUT: 'No respondió a tiempo',
  NETWORK: 'Sin conexión',
}

// The web service behind each operation, in the office's words.
const OPERATION_LABELS: Record<string, string> = {
  getTokenRest: 'Token (getTokenRest)',
  RESTNovedadesCartera: 'Cartera (RESTNovedadesCartera)',
  RESTDocumentosV2: 'Documentos (RESTDocumentosV2)',
  documentDownload: 'Descarga de PDF',
  RESTCotizadorAutV2: 'Cotizador (RESTCotizadorAutV2)',
}

export function triunfoOperationLabel(operation: string): string {
  return OPERATION_LABELS[operation] ?? operation
}

/** "30/10 20:19" */
export function formatDayTime(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`
}
