export const QUERY_KEYS = {
  admin: {
    profile: ['admin', 'profile'] as const,
    users: ['admin', 'users'] as const,
  },
  infoauto: {
    brands: (query?: string) => ['infoauto', 'brands', query ?? ''] as const,
    groups: (brandId: number, query?: string) => ['infoauto', 'groups', brandId, query ?? ''] as const,
    models: (brandId: number, groupId: number, query?: string) =>
      ['infoauto', 'models', brandId, groupId, query ?? ''] as const,
  },
} as const
