import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rejectionsService } from '@/src/services/rejections.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreateRejectionImportRequest, RejectionImport } from '@/src/types/api/rejections'
import { useAuth } from '../context/auth-context'

export function useRejectionImports() {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.rejectionImports,
    queryFn: () => rejectionsService.list(token as string),
    enabled: !!token,
  })
}

/** One import; refreshes every 2 s while notices are going out. */
export function useRejectionImport(id: number | null) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.rejectionImport(id ?? 0),
    queryFn: () => rejectionsService.detail(token as string, id as number),
    enabled: !!token && id !== null,
    refetchInterval: query => (query.state.data?.rows.some(row => row.status === 'SENDING') ? 2000 : false),
  })
}

export function useRejectionActions() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  // The detail comes back with every action: show it right away, then refresh the list's counts.
  const settle = (detail: RejectionImport) => {
    queryClient.setQueryData(QUERY_KEYS.admin.rejectionImport(detail.id), detail)
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.rejectionImports })
  }

  const create = useMutation({
    mutationFn: (data: CreateRejectionImportRequest) => rejectionsService.create(token as string, data),
    onSuccess: settle,
  })

  const send = useMutation({
    mutationFn: ({ id, ids }: { id: number; ids: number[] }) => rejectionsService.send(token as string, id, ids),
    onSuccess: settle,
  })

  const mark = useMutation({
    mutationFn: ({ id, ids }: { id: number; ids: number[] }) => rejectionsService.mark(token as string, id, ids),
    onSuccess: settle,
  })

  const remove = useMutation({
    mutationFn: (id: number) => rejectionsService.remove(token as string, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.rejectionsAll })
    },
  })

  return { create, send, mark, remove }
}
