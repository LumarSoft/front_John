'use client'

import { useState } from 'react'
import type { ScopeFilterValue } from '../components/scope-filter'
import { useProfile } from './use-profile'
import { useRole } from './use-role'

/**
 * The section filter of a SuperAdmin screen, opened on the office line (the
 * organization's default number, from /users/me) until they pick something
 * else, "Todos" included. Admins never get a default: the API already limits
 * them to their own numbers and the filter is hidden for them.
 */
export function useScopeFilterState(): [ScopeFilterValue, (value: ScopeFilterValue) => void] {
  const { isSuperAdmin } = useRole()
  const { data: profile } = useProfile()
  // Null until the user picks something: the default applies meanwhile.
  const [chosen, setChosen] = useState<ScopeFilterValue | null>(null)
  const defaultId = isSuperAdmin ? (profile?.organization?.defaultPhoneNumber?.id ?? null) : null
  const scope = chosen ?? (defaultId != null ? { phoneNumberId: defaultId } : {})
  return [scope, setChosen]
}
