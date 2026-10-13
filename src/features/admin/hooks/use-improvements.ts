import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { improvementsService } from '@/src/services/improvements.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ImprovementRequest, ImprovementsQuery, OwnerImprovementsQuery } from '@/src/types/api/improvements'
import { useAuth } from '../context/auth-context'

/** One page of the published improvements for the organization's users. */
export function useImprovements(params: ImprovementsQuery) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.improvements(params),
    queryFn: () => improvementsService.list(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

/** Sidebar badge: improvements published since the user last opened "Mejoras". */
export function useImprovementsUnseenCount(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.improvementsUnseen,
    queryFn: () => improvementsService.unseenCount(token as string),
    enabled: !!token && enabled,
    // New improvements are rare; a few minutes is plenty for the badge.
    refetchInterval: 5 * 60_000,
  })
}

/** Lumar (OWNER): one page of every improvement, drafts included. */
export function useOwnerImprovements(params: OwnerImprovementsQuery) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.owner.improvements(params),
    queryFn: () => improvementsService.ownerList(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

export function useOwnerImprovementActions() {
  const { token } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.improvementsAll })

  const create = useMutation({
    mutationFn: (data: ImprovementRequest) => improvementsService.create(token as string, data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ImprovementRequest> }) =>
      improvementsService.update(token as string, id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: number) => improvementsService.remove(token as string, id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
