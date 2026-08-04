import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { phoneNumbersService } from '@/src/services/phone-numbers.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import type { CreatePhoneNumberRequest, UpdatePhoneNumberRequest } from '@/src/types/api/phone-numbers'
import { useAuth } from '../context/auth-context'

export function usePhoneNumbers(enabled = true) {
  const { token } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.admin.phoneNumbers,
    queryFn: () => phoneNumbersService.list(token as string),
    enabled: !!token && enabled,
  })
}

export function usePhoneNumberMutations() {
  const { token } = useAuth()
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.admin.phoneNumbers })

  const create = useMutation({
    mutationFn: (data: CreatePhoneNumberRequest) => phoneNumbersService.create(token as string, data),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePhoneNumberRequest }) =>
      phoneNumbersService.update(token as string, id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: number) => phoneNumbersService.remove(token as string, id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
