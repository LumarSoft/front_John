import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationsService } from '@/src/services/organizations.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type {
  CreateOrganizationRequest,
  CreateProducerCodeRequest,
  CreateSuperAdminRequest,
  UpdateProducerCodeRequest,
} from '@/src/types/api/organizations'
import { useAuth } from '../context/auth-context'

export function useOrganizations(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.owner.organizations,
    queryFn: () => organizationsService.list(token as string),
    enabled: !!token && enabled,
  })
}

export function useOrganization(id: number | null) {
  const { token } = useAuth()
  return useQuery({
    queryKey: id != null ? QUERY_KEYS.owner.organization(id) : QUERY_KEYS.owner.organizations,
    queryFn: () => organizationsService.detail(token as string, id as number),
    enabled: !!token && id != null,
  })
}

export function useOrganizationMutations(orgId?: number) {
  const { token } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.organizations })
    if (orgId != null) qc.invalidateQueries({ queryKey: QUERY_KEYS.owner.organization(orgId) })
  }

  const create = useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationsService.create(token as string, data),
    onSuccess: invalidate,
  })
  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      organizationsService.setActive(token as string, id, isActive),
    onSuccess: invalidate,
  })
  const addCode = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProducerCodeRequest }) =>
      organizationsService.addCode(token as string, id, data),
    onSuccess: invalidate,
  })
  const updateCode = useMutation({
    mutationFn: ({ id, codeId, data }: { id: number; codeId: number; data: UpdateProducerCodeRequest }) =>
      organizationsService.updateCode(token as string, id, codeId, data),
    onSuccess: invalidate,
  })
  const addSuperAdmin = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSuperAdminRequest }) =>
      organizationsService.addSuperAdmin(token as string, id, data),
    onSuccess: invalidate,
  })

  return { create, setActive, addCode, updateCode, addSuperAdmin }
}
