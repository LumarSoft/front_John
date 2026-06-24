'use client'

import { useQuery } from '@tanstack/react-query'
import { publicService } from '@/src/services/public.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { FIELDS, type Field } from '../data/fields'

/**
 * Product-specific form fields from the single source (GET /public/products) —
 * the same catalog the WhatsApp bot consumes, so the web form and the bot ask
 * the exact same things and the lead reaches the admin with identical labels.
 *
 * Seeded with the bundled defaults so the form renders instantly (no flash) and
 * keeps working if the catalog request is in flight or fails; the API value wins
 * once loaded.
 */
export function useProductFields(productId: string): Field[] {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.public.products,
    queryFn: () => publicService.getProducts(),
    staleTime: 5 * 60 * 1000,
  })
  return data?.find(p => p.id === productId)?.fields ?? FIELDS[productId] ?? []
}
