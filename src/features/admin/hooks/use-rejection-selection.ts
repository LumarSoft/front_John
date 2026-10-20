import { useState } from 'react'
import type { Rejection } from '@/src/types/api/rejections'
import { canSend, isOpen } from '../lib/rejections-format'

/**
 * The rows ticked in an import. Starts with the ones ready to send, and starts
 * over whenever that set changes (another import, or a send that finished).
 */
export function useRejectionSelection(importId: number | null, rows: Rejection[] | undefined) {
  const readyIds = (rows ?? []).filter(row => row.status === 'READY').map(row => row.id)
  const key = `${importId}:${readyIds.join(',')}`
  const [state, setState] = useState<{ key: string; ids: Set<number> }>({ key: '', ids: new Set() })
  if (rows && state.key !== key) setState({ key, ids: new Set(readyIds) })

  const open = (rows ?? []).filter(isOpen)
  const selected = open.filter(row => state.ids.has(row.id))

  const toggle = (id: number) =>
    setState(current => {
      const ids = new Set(current.ids)
      if (ids.has(id)) ids.delete(id)
      else ids.add(id)
      return { ...current, ids }
    })

  const allSelected = open.length > 0 && selected.length === open.length
  const toggleAll = () =>
    setState(current => ({ ...current, ids: allSelected ? new Set() : new Set(open.map(row => row.id)) }))

  return {
    isSelected: (id: number) => state.ids.has(id),
    toggle,
    toggleAll,
    allSelected,
    someSelected: selected.length > 0 && !allSelected,
    // Without a usable WhatsApp a row can only be marked as told by hand.
    toSend: selected.filter(canSend),
    toMark: selected,
  }
}
