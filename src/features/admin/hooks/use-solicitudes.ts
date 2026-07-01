import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { solicitudesService } from '@/src/services/solicitudes.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { SolicitudesQuery, SolicitudKind } from '@/src/types/api/solicitudes'
import { useAuth } from '../context/auth-context'

export function useSolicitudes(params: SolicitudesQuery) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.solicitudes(params),
    queryFn: () => solicitudesService.list(params, token as string),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

/** Count of NEW (uncontacted) solicitudes, polled for the sidebar alert. */
export function useNewSolicitudesCount() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.solicitudes({ status: 'NEW', pageSize: 1 }),
    queryFn: () => solicitudesService.list({ status: 'NEW', pageSize: 1 }, token as string),
    enabled: !!token,
    refetchInterval: 20_000,
    select: page => page.total,
  })
}

export function useSolicitud(kind: SolicitudKind | null, id: number | null) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.solicitud(kind ?? '', id ?? 0),
    queryFn: () => solicitudesService.get(kind as SolicitudKind, id as number, token as string),
    enabled: !!token && !!kind && !!id,
  })
}
