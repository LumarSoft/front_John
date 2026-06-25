export type NovedadType = 'siniestro' | 'handoff'

export interface NovedadClient {
  id: number
  firstName: string
  lastName: string
  dni: string
}

export interface NovedadItem {
  id: number
  type: NovedadType
  refId: number
  title: string
  body: string | null
  readAt: string | null
  createdAt: string
  client: NovedadClient | null
}

export interface NovedadesPage {
  data: NovedadItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface NovedadesStats {
  unreadTotal: number
  unreadSiniestros: number
  unreadHandoff: number
}

export interface NovedadesQuery {
  type?: NovedadType
  unread?: boolean
  search?: string
  clientId?: number
  page?: number
  pageSize?: number
}
