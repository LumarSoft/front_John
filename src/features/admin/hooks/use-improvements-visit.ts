import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { improvementsService } from '@/src/services/improvements.service'
import { QUERY_KEYS } from '@/src/lib/query-keys'
import { useAuth } from '../context/auth-context'

/**
 * Registers the visit to "Mejoras" once per mount and returns the previous one,
 * so what was published since then can still be badged as new on this screen,
 * and how many those are (the screen only holds one page, so it can't count them).
 * `undefined` while it is being registered; `null` on a first visit.
 */
export function useImprovementsVisit(): { previousVisitAt: string | null | undefined; newCount: number } {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const started = useRef(false)
  const [previousVisitAt, setPreviousVisitAt] = useState<string | null | undefined>(undefined)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    void improvementsService
      .visit(token)
      .then(result => {
        setPreviousVisitAt(result.previousVisitAt)
        setNewCount(result.newCount ?? 0)
        queryClient.setQueryData(QUERY_KEYS.admin.improvementsUnseen, { count: 0 })
      })
      .catch(() => toast.error('No se pudo registrar la visita. Podés ver las mejoras igual.'))
  }, [token, queryClient])

  return { previousVisitAt, newCount }
}
