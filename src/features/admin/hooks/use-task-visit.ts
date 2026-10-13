import { useEffect, useRef, useState } from 'react'
import type { Task } from '@/src/types/api/tasks'
import { useTaskActions } from './use-task-actions'

/**
 * The first time "Para mí" loads, remembers which tasks were new (to keep the
 * label during this visit) and marks them as seen for the next one.
 */
export function useTaskVisit(tasks: Task[] | undefined, active: boolean): Set<number> {
  const { markSeen } = useTaskActions()
  const [newIds, setNewIds] = useState<Set<number>>(() => new Set())
  const visited = useRef(false)

  useEffect(() => {
    if (!active || !tasks || visited.current) return
    visited.current = true
    const unseen = tasks.filter(task => task.seenAt === null).map(task => task.id)
    if (unseen.length === 0) return
    // Deferred so the state update stays out of the effect body (react-hooks rule).
    setTimeout(() => setNewIds(new Set(unseen)), 0)
    markSeen.mutate()
  }, [active, tasks, markSeen])

  return newIds
}
