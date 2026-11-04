import type {
  IntegrationBlame,
  IntegrationComponentKey,
  IntegrationIncident,
  IntegrationState,
  StatusOverview,
  WhatsappNumberStatus,
} from '@/src/types/api/status'
import { numberLabel } from './number-label'

export type Provider = 'Triunfo' | 'InfoAuto'

interface ComponentCopy {
  provider: Provider
  name: string
  /** What it is for, in the office's words. */
  usedFor: string
  /** What stops working while it fails. */
  impact: string
}

export const COMPONENT_COPY: Record<IntegrationComponentKey, ComponentCopy> = {
  'triunfo.getTokenRest': {
    provider: 'Triunfo',
    name: 'Acceso a Triunfo',
    usedFor: 'Abre la sesión con Triunfo para cotizar y pedir documentación.',
    impact: 'Sin acceso no se puede cotizar ni pedir documentación a Triunfo.',
  },
  'triunfo.RESTCotizadorAutV2': {
    provider: 'Triunfo',
    name: 'Cotizador de autos y motos',
    usedFor: 'Las cotizaciones del bot y del panel.',
    impact: 'El bot no puede cotizar y pasa el pedido a la oficina.',
  },
  'triunfo.RESTDocumentosV2': {
    provider: 'Triunfo',
    name: 'Documentación de pólizas',
    usedFor: 'Los documentos de cada póliza: certificado, póliza, tarjeta Mercosur, constancia de pago y cuponera.',
    impact: 'El bot no puede mandar documentación ni se puede bajar desde Asegurados: el pedido pasa a la oficina.',
  },
  'triunfo.documentDownload': {
    provider: 'Triunfo',
    name: 'Descarga de PDFs',
    usedFor: 'Bajar cada documento desde TriunfoNet.',
    impact: 'La lista de documentos llega, pero los PDFs no se pueden bajar.',
  },
  'triunfo.RESTNovedadesCartera': {
    provider: 'Triunfo',
    name: 'Cartera',
    usedFor: 'La actualización de pólizas, cuotas y pagos, a las 06:00 y a las 20:00.',
    impact: 'Pólizas, cuotas y pagos quedan como en la última actualización que anduvo.',
  },
  'infoauto.cars': {
    provider: 'InfoAuto',
    name: 'Catálogo de autos',
    usedFor: 'Marcas, modelos y versiones para cotizar autos.',
    impact: 'No se puede elegir el vehículo, así que no se pueden cotizar autos.',
  },
  'infoauto.motorcycles': {
    provider: 'InfoAuto',
    name: 'Catálogo de motos',
    usedFor: 'Marcas, modelos y versiones para cotizar motos.',
    impact: 'No se puede elegir la moto, así que no se pueden cotizar motos.',
  },
}

export interface Diagnosis {
  title: string
  detail: string
  /** What it takes for it to work again. */
  resolution: string
  /** Where the problem is: the provider's side, or the platform's own user or subscription with it. */
  origin: string
}

/** Why a service is failing, in plain words, from how its calls fail. */
export function diagnose(provider: Provider, incident: Pick<IntegrationIncident, 'kind' | 'httpStatus'>): Diagnosis {
  const status = incident.httpStatus
  const theirs = `${provider}, no la plataforma.`
  const selfHealing = `No hace falta hacer nada: vuelve a andar solo cuando ${provider} lo resuelva.`
  switch (incident.kind) {
    case 'HTTP_ERROR':
      if (status === 404) {
        return {
          title: 'El servicio ya no está en esa dirección',
          detail: `${provider} responde que la página no existe (error 404): dio de baja o movió este servicio sin avisar. Su servidor está en línea, así que el cambio es de su lado.`,
          resolution: `Si es una baja temporal, vuelve a andar solo. Si lo movieron, la integración se actualiza apenas ${provider} informe la dirección nueva.`,
          origin: theirs,
        }
      }
      if (status === 401 || status === 403) {
        return {
          title: 'Bloquea el acceso',
          detail: `${provider} rechaza el acceso a este servicio (error ${status}). Suele ser un control nuevo de su lado.`,
          resolution: `Hay que averiguar con ${provider} qué cambió; puede hacer falta ajustar la integración.`,
          origin: theirs,
        }
      }
      if (status !== null && status >= 500) {
        return {
          title: 'Su servidor está fallando',
          detail: `El servidor de ${provider} responde con error (${status}). Es una falla de su lado y suele resolverse sola.`,
          resolution: selfHealing,
          origin: theirs,
        }
      }
      return {
        title: `Responde con error ${status ?? ''}`.trim(),
        detail: `${provider} responde con un error${status ? ` (${status})` : ''} a los pedidos de este servicio.`,
        resolution: `Hay que averiguar con ${provider} qué cambió.`,
        origin: theirs,
      }
    case 'TIMEOUT':
      return {
        title: 'No responde a tiempo',
        detail: `${provider} no contesta: el servicio está caído o muy lento de su lado.`,
        resolution: selfHealing,
        origin: theirs,
      }
    case 'NETWORK':
      return {
        title: 'No se puede conectar',
        detail: `No hay conexión con el servidor de ${provider}: está caído o fuera de línea.`,
        resolution: selfHealing,
        origin: theirs,
      }
    case 'UNEXPECTED_RESPONSE':
      return {
        title: 'Cambió la respuesta',
        detail: `${provider} contesta, pero con un formato distinto al de siempre: cambiaron el servicio sin avisar.`,
        resolution: 'Hay que adaptar la integración al formato nuevo; mientras tanto este servicio no anda.',
        origin: theirs,
      }
    case 'CREDENTIALS_REJECTED':
      return {
        title: 'Rechaza el usuario de la plataforma',
        detail: `${provider} rechaza el usuario con el que entra la plataforma.`,
        resolution: `Hay que revisar la cuenta o la suscripción con ${provider}.`,
        origin: `La cuenta de la plataforma con ${provider}.`,
      }
  }
}

/** Why a WhatsApp number does not work, or null while it does. */
export function whatsappProblem(number: WhatsappNumberStatus): Omit<Diagnosis, 'origin'> | null {
  if (number.disconnectedAt) {
    return {
      title: 'Meta desconectó el número',
      detail: `Desde ${formatWhen(number.disconnectedAt)} el número no recibe ni manda mensajes por la plataforma${
        number.disconnectReason ? ` (motivo de Meta: ${number.disconnectReason})` : ''
      }.`,
      resolution: 'Lo vuelve a conectar el SuperAdmin desde Números → Reconectar.',
    }
  }
  if (number.status === 'failing' && number.tokenExpiresAt) {
    return {
      title: 'Venció el permiso de Meta',
      detail: `El permiso con el que la plataforma usa el número venció ${formatWhen(number.tokenExpiresAt)}.`,
      resolution: 'Lo vuelve a conectar el SuperAdmin desde Números → Reconectar.',
    }
  }
  return null
}

// A Meta permission that expires within this long is announced before it does.
const TOKEN_NOTICE_MS = 14 * 24 * 60 * 60 * 1000

export function tokenExpiresSoon(number: WhatsappNumberStatus, now = new Date()): boolean {
  if (!number.tokenExpiresAt || number.status === 'failing') return false
  return new Date(number.tokenExpiresAt).getTime() - now.getTime() < TOKEN_NOTICE_MS
}

/** What is failing right now, in the order the section lists it: "Documentación de pólizas (Triunfo)". */
export function failingNames(overview: StatusOverview): string[] {
  const triunfo = usesTriunfo(overview)
  return [
    ...overview.triunfoAccess
      .filter(a => a.configured && a.failingSince)
      .map(a => `Usuario de TriunfoNet de ${a.producerName}`),
    ...overview.components
      .filter(c => c.status === 'failing' && (triunfo || !c.key.startsWith('triunfo.')))
      .map(c => `${COMPONENT_COPY[c.key].name} (${COMPONENT_COPY[c.key].provider})`),
    ...overview.whatsapp.filter(n => n.status === 'failing').map(n => `WhatsApp ${numberLabel(n)}`),
  ]
}

/** Who is responsible, as the AI model says: "Triunfo", "la plataforma". */
export function blameLabel(blame: IntegrationBlame, provider: Provider): string {
  if (blame === 'PROVIDER') return provider
  if (blame === 'PLATFORM') return 'la plataforma'
  return 'sin determinar'
}

export const STATE_LABELS: Record<IntegrationState, string> = {
  operational: 'Funciona',
  failing: 'No funciona',
  unknown: 'Sin datos',
}

/** Whether Triunfo's services matter here: the OWNER always, an organization only when it has Triunfo connected. */
export function usesTriunfo(overview: StatusOverview): boolean {
  return overview.triunfoAccess.length === 0 || overview.triunfoAccess.some(a => a.configured)
}

/** "hoy 13:39", "ayer 22:10", "3/11 00:32" */
export function formatWhen(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  const day = (d: Date) => d.toLocaleDateString('es-AR')
  if (day(date) === day(now)) return `hoy ${time}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (day(date) === day(yesterday)) return `ayer ${time}`
  return `${date.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })} ${time}`
}

/** "45 min", "3 h 20 min", "2 días" */
export function formatDuration(fromIso: string, toIso: string | null, now = new Date()): string {
  const minutes = Math.max(
    1,
    Math.round(((toIso ? new Date(toIso) : now).getTime() - new Date(fromIso).getTime()) / 60_000),
  )
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`
  return `${Math.floor(hours / 24)} días`
}

export function failuresLabel(failures: number): string {
  return `${failures} ${failures === 1 ? 'intento fallido' : 'intentos fallidos'}`
}
