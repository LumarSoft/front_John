import { useQuery } from '@tanstack/react-query'
import { templatesService } from '@/src/services/templates.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/** Each call asks Meta: keep the answer a few minutes unless the owner refreshes it. */
const STALE_MS = 5 * 60 * 1000

/** The Meta templates of every organization's WhatsApp accounts (owner). */
export function useOwnerTemplates(enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.owner.templates,
    queryFn: () => templatesService.overview(token as string),
    enabled: !!token && enabled,
    staleTime: STALE_MS,
  })
}
