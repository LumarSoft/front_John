import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsService } from '@/src/services/campaigns.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type {
  AssignOpportunitiesRequest,
  CampaignCandidatesQuery,
  CampaignKind,
  CampaignResultsQuery,
  CreateCampaignTasksRequest,
  UpdateCampaignRequest,
  UpdateOpportunityRequest,
} from '@/src/types/api/campaigns'
import { useAuth } from '../context/auth-context'

/** While a campaign message waits for Meta, the list asks again every minute. */
const PENDING_REFRESH_MS = 60_000

/** The organization's five campaigns, with their message, review status and how many clients each finds. */
export function useCampaigns() {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.campaigns,
    queryFn: () => campaignsService.list(token as string),
    enabled: !!token,
    refetchInterval: query =>
      query.state.data?.campaigns.some(c => c.templates.some(t => t.status === 'PENDING')) ? PENDING_REFRESH_MS : false,
  })
}

/** The clients one campaign finds; refreshes every 2 s while its messages are going out. */
export function useCampaignCandidates(kind: CampaignKind, params: CampaignCandidatesQuery, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.campaignCandidates(kind, params),
    queryFn: () => campaignsService.candidates(token as string, kind, params),
    enabled: !!token && enabled,
    placeholderData: keepPreviousData,
    refetchInterval: query =>
      query.state.data?.data.some(row => row.lastMessage?.status === 'SENDING') ? 2000 : false,
  })
}

/** How the campaigns did in a period (one campaign, or all of them). */
export function useCampaignResults(params: CampaignResultsQuery, enabled = true) {
  const { token } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.admin.campaignResults(params),
    queryFn: () => campaignsService.results(token as string, params),
    enabled: !!token && enabled,
    placeholderData: keepPreviousData,
  })
}

/** Turn a campaign on or off, change its message, percentage or settings, or ask Meta about its review. */
export function useCampaignSettingsActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.campaignsAll })
  }

  const update = useMutation({
    mutationFn: ({ kind, data }: { kind: CampaignKind; data: UpdateCampaignRequest }) =>
      campaignsService.update(token as string, kind, data),
    onSuccess: refresh,
  })

  const refreshTemplates = useMutation({
    mutationFn: (kind: CampaignKind) => campaignsService.refreshTemplates(token as string, kind),
    onSuccess: refresh,
  })

  return { update, refreshTemplates }
}

/**
 * Send a campaign to the ticked clients, mark them contacted, leave them out
 * for good (or back in), assign them to someone, create their tasks or say what
 * came of one; lists refresh after each.
 */
export function useCampaignActions(kind: CampaignKind) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.campaignsAll })
  }

  const send = useMutation({
    mutationFn: (ids: number[]) => campaignsService.send(token as string, kind, ids),
    onSuccess: refresh,
  })

  const mark = useMutation({
    mutationFn: (ids: number[]) => campaignsService.mark(token as string, kind, ids),
    onSuccess: refresh,
  })

  const optOut = useMutation({
    mutationFn: (ids: number[]) => campaignsService.optOut(token as string, kind, ids),
    onSuccess: refresh,
  })

  const optIn = useMutation({
    mutationFn: (ids: number[]) => campaignsService.optIn(token as string, kind, ids),
    onSuccess: refresh,
  })

  const createTasks = useMutation({
    mutationFn: (data: CreateCampaignTasksRequest) => campaignsService.createTasks(token as string, kind, data),
    onSuccess: () => {
      refresh()
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.tasksAll })
    },
  })

  const assign = useMutation({
    mutationFn: (data: AssignOpportunitiesRequest) => campaignsService.assign(token as string, kind, data),
    onSuccess: refresh,
  })

  const updateOpportunity = useMutation({
    mutationFn: ({ targetId, data }: { targetId: number; data: UpdateOpportunityRequest }) =>
      campaignsService.updateOpportunity(token as string, kind, targetId, data),
    onSuccess: refresh,
  })

  return { send, mark, optOut, optIn, createTasks, assign, updateOpportunity }
}
