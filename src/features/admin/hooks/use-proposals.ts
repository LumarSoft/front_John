import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { improvementsService } from '@/src/services/improvements.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { ProposalRequest, ProposalUpdate } from '@/src/types/api/improvements'
import { useAuth } from '../context/auth-context'

/** The organization's shared board of proposals. */
export function useProposals() {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.proposals,
    queryFn: () => improvementsService.proposals(token as string),
    enabled: !!token,
  })
}

export function useCreateProposal() {
  const { token } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProposalRequest) => improvementsService.propose(token as string, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.proposals }),
  })
}

/** Lumar (OWNER): every organization's proposals. */
export function useOwnerProposals() {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.owner.proposals,
    queryFn: () => improvementsService.ownerProposals(token as string),
    enabled: !!token,
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
      qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.proposals })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.proposalsNew })
    },
  })
}
