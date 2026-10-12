export type ImprovementArea = 'BOT' | 'BANDEJA' | 'COTIZADOR' | 'PANEL' | 'PORTAL'

export const IMPROVEMENT_AREAS: ImprovementArea[] = ['BOT', 'BANDEJA', 'COTIZADOR', 'PANEL', 'PORTAL']

export const IMPROVEMENT_AREA_LABEL: Record<ImprovementArea, string> = {
  BOT: 'Bot de WhatsApp',
  BANDEJA: 'Bandeja',
  COTIZADOR: 'Cotizador',
  PANEL: 'Panel',
  PORTAL: 'Portal de clientes',
}

export interface Improvement {
  id: number
  title: string
  summary: string
  beforeText: string | null
  afterText: string | null
  example: string | null
  area: ImprovementArea
  /** Date of the change (ISO, midnight UTC). */
  releasedOn: string | null
  /** Null = draft (only the owner sees it). */
  publishedAt: string | null
}

export interface OwnerImprovement extends Improvement {
  producerId: number | null
  producer: { id: number; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface ImprovementRequest {
  title: string
  summary: string
  beforeText: string
  afterText: string
  example: string
  area: ImprovementArea
  /** YYYY-MM-DD or null. */
  releasedOn: string | null
  /** Null = every organization. */
  producerId: number | null
  published?: boolean
}
