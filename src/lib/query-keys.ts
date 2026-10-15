import type { AdminClientsQuery } from '@/src/types/api/clients'
import type { CobranzasQuery } from '@/src/types/api/cobranzas'
import type { VehicleType } from '@/src/types/api/cotizador'
import type {
  ImprovementsQuery,
  OwnerImprovementsQuery,
  OwnerProposalsQuery,
  PageQuery,
} from '@/src/types/api/improvements'
import type { NovedadesQuery } from '@/src/types/api/novedades'
import type { SolicitudesQuery } from '@/src/types/api/solicitudes'
import type { TasksQuery } from '@/src/types/api/tasks'
import type { AdminSiniestrosQuery } from '@/src/services/siniestros.service'

export const QUERY_KEYS = {
  inbox: {
    conversations: (status?: string, search?: string, scope?: { producerCodeId?: number; phoneNumberId?: number }) =>
      ['admin', 'inbox', 'list', status ?? 'all', search ?? '', scope ?? {}] as const,
    messages: (id: number) => ['admin', 'inbox', id, 'messages'] as const,
  },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    profile: ['admin', 'profile'] as const,
    config: ['admin', 'config'] as const,
    users: ['admin', 'users'] as const,
    producerCodes: ['admin', 'producer-codes'] as const,
    phoneNumbers: ['admin', 'phone-numbers'] as const,
    embeddedSignupConfig: ['admin', 'embedded-signup-config'] as const,
    clients: (params?: AdminClientsQuery) => ['admin', 'clients', 'list', params ?? {}] as const,
    clientsStats: ['admin', 'clients', 'stats'] as const,
    client: (id: number) => ['admin', 'clients', id] as const,
    clientPolizaDocumentos: (clientId: number, polizaId: number) =>
      ['admin', 'clients', clientId, 'polizas', polizaId, 'documentos'] as const,
    cobranzas: (params?: CobranzasQuery) => ['admin', 'cobranzas', 'list', params ?? {}] as const,
    cobranzasStats: ['admin', 'cobranzas', 'stats'] as const,
    novedades: (params?: NovedadesQuery) => ['admin', 'novedades', 'list', params ?? {}] as const,
    novedadesStats: ['admin', 'novedades', 'stats'] as const,
    siniestros: (params?: AdminSiniestrosQuery) => ['admin', 'siniestros', 'list', params ?? {}] as const,
    siniestrosStats: ['admin', 'siniestros', 'stats'] as const,
    siniestro: (id: number) => ['admin', 'siniestros', id] as const,
    solicitudes: (params?: SolicitudesQuery) => ['admin', 'solicitudes', 'list', params ?? {}] as const,
    solicitud: (kind: string, id: number) => ['admin', 'solicitudes', kind, id] as const,
    pricingPlans: ['admin', 'pricing'] as const,
    businessHours: ['admin', 'business-hours'] as const,
    coverageSettings: ['admin', 'coverage-settings'] as const,
    improvements: (params?: ImprovementsQuery) => ['admin', 'improvements', 'list', params ?? {}] as const,
    improvementsUnseen: ['admin', 'improvements', 'unseen'] as const,
    proposalsAll: ['admin', 'improvement-proposals'] as const,
    proposals: (params?: PageQuery) => ['admin', 'improvement-proposals', 'list', params ?? {}] as const,
    tasksAll: ['admin', 'tasks'] as const,
    tasks: (params: TasksQuery) => ['admin', 'tasks', 'list', params] as const,
    tasksStats: ['admin', 'tasks', 'stats'] as const,
    taskPeople: ['admin', 'tasks', 'people'] as const,
  },
  owner: {
    organizations: ['owner', 'organizations'] as const,
    organization: (id: number) => ['owner', 'organizations', id] as const,
    improvementsAll: ['owner', 'improvements'] as const,
    improvements: (params?: OwnerImprovementsQuery) => ['owner', 'improvements', 'list', params ?? {}] as const,
    proposalsAll: ['owner', 'improvement-proposals'] as const,
    proposals: (params?: OwnerProposalsQuery) => ['owner', 'improvement-proposals', 'list', params ?? {}] as const,
    proposalsNew: ['owner', 'improvement-proposals', 'new'] as const,
  },
  pricing: {
    plans: (productType: string) => ['pricing', productType] as const,
  },
  infoauto: {
    brands: (vehicleType: VehicleType, query?: string) => ['infoauto', vehicleType, 'brands', query ?? ''] as const,
    groups: (vehicleType: VehicleType, brandId: number, query?: string) =>
      ['infoauto', vehicleType, 'groups', brandId, query ?? ''] as const,
    models: (vehicleType: VehicleType, brandId: number, groupId: number, query?: string) =>
      ['infoauto', vehicleType, 'models', brandId, groupId, query ?? ''] as const,
  },
  portal: {
    polizas: ['portal', 'polizas'] as const,
    poliza: (id: number) => ['portal', 'polizas', id] as const,
    polizaDocumentos: (id: number) => ['portal', 'polizas', id, 'documentos'] as const,
    siniestros: ['portal', 'siniestros'] as const,
    siniestro: (id: number) => ['portal', 'siniestros', id] as const,
  },
  public: {
    producer: ['public', 'producer'] as const,
    products: ['public', 'products'] as const,
  },
} as const
