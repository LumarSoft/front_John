import type { AdminUserProducerCode } from '@/src/types/api/auth'
import { useProfile } from './use-profile'

/** Codes granted to the signed-in admin (empty for a SuperAdmin, who has all of them). */
export function useOwnProducerCodes(): AdminUserProducerCode['producerCode'][] {
  const { data } = useProfile()
  return (data?.producerCodes ?? []).map(grant => grant.producerCode)
}
