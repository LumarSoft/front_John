import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function clientIdOf(value: string | null): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * The client whose file Asegurados shows. `?cliente=ID` (the assistant's
 * links) opens it, also when the page is already open; closing it leaves the
 * URL clean.
 */
export function useLinkedClient() {
  const router = useRouter()
  const linked = clientIdOf(useSearchParams().get('cliente'))
  const [selectedId, setSelectedId] = useState<number | null>(linked)
  const [seenLink, setSeenLink] = useState<number | null>(linked)

  // A new link while Asegurados is already open opens that client.
  if (linked !== seenLink) {
    setSeenLink(linked)
    if (linked !== null) setSelectedId(linked)
  }

  const close = () => {
    setSelectedId(null)
    if (linked !== null) router.replace('/admin/asegurados', { scroll: false })
  }

  return { selectedId, open: setSelectedId, close }
}
