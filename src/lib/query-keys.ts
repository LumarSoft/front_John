import type { AdminClientsQuery } from '@/src/types/api/clients'
import type { CobranzasQuery } from '@/src/types/api/cobranzas'

export const QUERY_KEYS = {
  admin: {
    profile: ['admin', 'profile'] as const,
    users: ['admin', 'users'] as const,
    clients: (params?: AdminClientsQuery) => ['admin', 'clients', 'list', params ?? {}] as const,
    clientsStats: ['admin', 'clients', 'stats'] as const,
    client: (id: number) => ['admin', 'clients', id] as const,
    cobranzas: (params?: CobranzasQuery) => ['admin', 'cobranzas', 'list', params ?? {}] as const,
    cobranzasStats: ['admin', 'cobranzas', 'stats'] as const,
  },
  infoauto: {
    brands: (query?: string) => ['infoauto', 'brands', query ?? ''] as const,
    groups: (brandId: number, query?: string) => ['infoauto', 'groups', brandId, query ?? ''] as const,
    models: (brandId: number, groupId: number, query?: string) =>
      ['infoauto', 'models', brandId, groupId, query ?? ''] as const,
  },
} as const
