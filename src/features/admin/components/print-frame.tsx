'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders a document into an isolated, print-only layer and opens the browser print dialog (where the user can save
 * as PDF). Native print is used on purpose: Tailwind v4 emits oklch colors that html-to-canvas libraries fail to
 * rasterize. A single card (`flow` off) is centred on one page; a report (`flow`) runs over as many pages as it needs.
 */
export function PrintFrame({
  children,
  onDone,
  flow = false,
}: {
  children: ReactNode
  onDone: () => void
  flow?: boolean
}) {
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    const handleAfterPrint = () => onDoneRef.current()
    window.addEventListener('afterprint', handleAfterPrint)
    const timer = window.setTimeout(() => window.print(), 80)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return createPortal(<div className={flow ? 'print-area print-flow' : 'print-area'}>{children}</div>, document.body)
}
