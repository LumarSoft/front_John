import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminConfigService } from '@/src/services/admin-config.service'
import { organizationsService } from '@/src/services/organizations.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/** The SuperAdmin's own organization logo; the profile (sidebar, credential) refreshes after it. */
export function useOwnLogo() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.profile })

  const upload = useMutation({
    mutationFn: (file: File) => adminConfigService.uploadLogo(token as string, file),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: () => adminConfigService.removeLogo(token as string),
    onSuccess: refresh,
  })
  return { upload, remove }
}

/** Any organization's logo, set by the owner from Organizaciones. */
export function useOrganizationLogo(orgId: number) {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.organizations })
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owner.organization(orgId) })
  }

  const upload = useMutation({
    mutationFn: (file: File) => organizationsService.uploadLogo(token as string, orgId, file),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: () => organizationsService.removeLogo(token as string, orgId),
    onSuccess: refresh,
  })
  return { upload, remove }
}
