import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { fetchPolizas, fetchPoliza } from '@/src/services/polizas.service'
import { fetchSiniestros, fetchSiniestro } from '@/src/services/siniestros.service'

export function usePolizas() {
  return useQuery({
    queryKey: QUERY_KEYS.portal.polizas,
    queryFn: fetchPolizas,
  })
}

export function usePoliza(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.portal.poliza(id),
    queryFn: () => fetchPoliza(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useSiniestros() {
  return useQuery({
    queryKey: QUERY_KEYS.portal.siniestros,
    queryFn: fetchSiniestros,
  })
}

export function useSiniestro(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.portal.siniestro(id),
    queryFn: () => fetchSiniestro(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}
