'use client'

import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/src/services/public.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { DEFAULT_ATTENTION_HOURS } from '@/src/lib/attention-hours'

/**
 * The producer's attention window, from the single public source. Seeded with the
 * app default so client components render the right copy instantly (no flash) and
 * update only if the configured value differs.
 */
export function useAttentionHours(): string {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.public.producer,
    queryFn: () => publicService.getProducerInfo(),
    staleTime: 5 * 60 * 1000,
  })
  return data?.attentionHours?.trim() || DEFAULT_ATTENTION_HOURS
}
