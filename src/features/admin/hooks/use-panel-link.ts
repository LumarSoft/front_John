import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Deep links into the panel, as the AI assistant and its cards send them:
 *
 *   ?tab=<value>      a screen with tabs opens on that tab (useUrlTab, also ?vista= in Tareas)
 *   ?seccion=<anchor> the element with data-help="<anchor>" scrolls into view and lights up (SectionFocus)
 *   ?numero=<id>      Números opens that number's assistant (useLinkedId), like ?cliente= in Asegurados
 *
 * A link followed while the screen is already open applies too.
 */

/** Changes the URL's query without a navigation (Next keeps useSearchParams in step). */
export function setUrlParams(changes: Record<string, string | null>): void {
  const url = new URL(window.location.href)
  for (const [name, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(name)
    else url.searchParams.set(name, value)
  }
  window.history.replaceState(window.history.state, '', url)
}

/**
 * A tab kept in the URL (`?tab=` by default): a link picks it, and picking one
 * by hand writes it back, so the next link to another tab is noticed and a
 * reload stays on it.
 */
export function useUrlTab<T extends string>(tabs: readonly T[], fallback: T, param = 'tab'): [T, (tab: T) => void] {
  const value = useSearchParams().get(param)
  const linked = value !== null && (tabs as readonly string[]).includes(value) ? (value as T) : null
  const [tab, setTab] = useState<T>(linked ?? fallback)
  const [seen, setSeen] = useState<T | null>(linked)

  if (linked !== seen) {
    setSeen(linked)
    if (linked !== null) setTab(linked)
  }

  const change = (next: T) => {
    setTab(next)
    setSeen(next)
    setUrlParams({ [param]: next, seccion: null })
  }

  return [tab, change]
}

function positiveInt(value: string | null): number | null {
  const id = Number(value)
  return value !== null && Number.isInteger(id) && id > 0 ? id : null
}

/**
 * A record a link opens (`?numero=12`): `onLink` runs once per new link, also
 * when the screen is already open. The returned function takes the id out of
 * the URL, for when the person closes what it opened.
 */
export function useLinkedId(param: string, onLink: (id: number) => void): () => void {
  const linked = positiveInt(useSearchParams().get(param))
  const [seen, setSeen] = useState<number | null>(null)

  if (linked !== seen) {
    setSeen(linked)
    if (linked !== null) onLink(linked)
  }

  return () => {
    if (linked !== null) setUrlParams({ [param]: null, seccion: null })
  }
}
