import { useRef, useState, type RefObject } from 'react'

interface ListPage {
  page: number
  /** Goes to a page and brings the top of the list into view (the cards are tall). */
  goTo: (page: number) => void
  /** Back to the first page, for when a filter changes. */
  reset: () => void
  /** Steps back when the list shrank under the current page (an item published, answered or deleted). */
  keepWithin: (totalPages: number | undefined) => void
  /** Put it on the element the list should scroll back to. */
  topRef: RefObject<HTMLDivElement | null>
}

/** Current page of a server-paginated list. */
export function useListPage(): ListPage {
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const goTo = (next: number) => {
    setPage(next)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const keepWithin = (totalPages: number | undefined) => {
    if (totalPages !== undefined && page > totalPages) setPage(totalPages)
  }

  return { page, goTo, reset: () => setPage(1), keepWithin, topRef }
}
