'use client'

import { useAttentionHours } from '@/src/hooks/use-attention-hours'

/**
 * Renders the producer's attention window from the single public source. A thin
 * client component so server components (e.g. the footer) can show the live value
 * without becoming async or fetching server-side.
 */
export function AttentionHoursText() {
  return <>{useAttentionHours()}</>
}
