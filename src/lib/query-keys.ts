import type { AdminClientsQuery } from '@/src/types/api/clients'
import type { CobranzasQuery } from '@/src/types/api/cobranzas'
import type { VehicleType } from '@/src/types/api/cotizador'

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
    brands: (vehicleType: VehicleType, query?: string) => ['infoauto', vehicleType, 'brands', query ?? ''] as const,
    groups: (vehicleType: VehicleType, brandId: number, query?: string) =>
      ['infoauto', vehicleType, 'groups', brandId, query ?? ''] as const,
    models: (vehicleType: VehicleType, brandId: number, groupId: number, query?: string) =>
      ['infoauto', vehicleType, 'models', brandId, groupId, query ?? ''] as const,
  },
} as const
