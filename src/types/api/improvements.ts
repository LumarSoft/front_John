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

export type ProposalStatus = 'NEW' | 'REVIEWING' | 'PLANNED' | 'DONE' | 'DISCARDED'

export const PROPOSAL_STATUSES: ProposalStatus[] = ['NEW', 'REVIEWING', 'PLANNED', 'DONE', 'DISCARDED']

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  NEW: 'Nueva',
  REVIEWING: 'En análisis',
  PLANNED: 'Planificada',
  DONE: 'Hecha',
  DISCARDED: 'Descartada',
}

export interface Proposal {
  id: number
  title: string
  description: string
  status: ProposalStatus
  /** Lumar's answer, visible to the whole organization. */
  response: string | null
  respondedAt: string | null
  createdAt: string
  author: { email: string } | null
  /** True when the current user proposed it. */
  mine: boolean
}

export interface OwnerProposal extends Omit<Proposal, 'mine'> {
  producer: { id: number; name: string }
}

export interface ProposalRequest {
  title: string
  description: string
}

export interface ProposalUpdate {
  status?: ProposalStatus
  response?: string
}
