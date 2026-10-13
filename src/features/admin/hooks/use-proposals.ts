import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { improvementsService } from '@/src/services/improvements.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { OwnerProposalsQuery, PageQuery, ProposalRequest, ProposalUpdate } from '@/src/types/api/improvements'
import { useAuth } from '../context/auth-context'

/** One page of the organization's shared board of proposals. */
export function useProposals(params: PageQuery) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.proposals(params),
    queryFn: () => improvementsService.proposals(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

export function useCreateProposal() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProposalRequest) => improvementsService.propose(token as string, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.proposalsAll }),
  })
}

/** Lumar (OWNER): one page of every organization's proposals. */
export function useOwnerProposals(params: OwnerProposalsQuery) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.owner.proposals(params),
    queryFn: () => improvementsService.ownerProposals(token as string, params),
    enabled: !!token,
    placeholderData: keepPreviousData,
  })
}

/** OWNER sidebar badge: proposals still in "Nueva". */
export function useNewProposalsCount(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.owner.proposalsNew,
    queryFn: () => improvementsService.newProposalsCount(token as string),
    enabled: !!token && enabled,
    refetchInterval: 5 * 60_000,
  })
}

export function useUpdateProposal() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProposalUpdate }) =>
      improvementsService.updateProposal(token as string, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.proposalsAll })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.proposalsNew })
    },
  })
}
