'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { setUrlParams } from '../hooks/use-panel-link'

/** How long to wait for the section to show up and settle (a tab, a sheet, data loading). */
const FIND_FOR_MS = 8000
/** The section has to stay put this long (what loads above it pushes it down) before scrolling to it. */
const SETTLE_MS = 300
/** How long it stays lit. */
const LIT_MS = 2800
/** Room for the panel's sticky top bar when a tall section scrolls to the top. */
const TOP_BAR = 72

const PULSE = {
  opacity: 1,
  scale: 1,
  boxShadow: [
    '0 0 0 0px var(--color-ember-ring)',
    '0 0 0 10px var(--color-ember-ring)',
    '0 0 0 0px var(--color-ember-ring)',
  ],
}
const STILL = { opacity: 1, scale: 1 }
const PULSE_TRANSITION = { duration: 0.25, boxShadow: { duration: 1.3, repeat: 1, ease: 'easeInOut' } } as const

/**
 * `?seccion=<anchor>`: once the element with that data-help has rendered and
 * stopped moving, it scrolls into view and lights up for a moment, so a link
 * from the assistant lands on the exact field, not just the screen. Then the
 * parameter leaves the URL, ready for the next link.
 */
export function SectionFocus() {
  const section = useSearchParams().get('seccion')
  const reduced = useReducedMotion()
  const [lit, setLit] = useState(false)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!section || !/^[a-z0-9-]+$/.test(section)) return
    let frame = 0
    let element: HTMLElement | null = null
    let phase: 'find' | 'settle' | 'lit' = 'find'
    let lastTop = 0
    let stableSince = 0
    let litUntil = 0
    const started = performance.now()

    const finish = () => {
      setLit(false)
      setUrlParams({ seccion: null })
    }

    // The ring follows the element straight through the DOM: no React render per frame.
    const place = () => {
      const ring = ringRef.current
      if (!ring || !element) return
      const rect = element.getBoundingClientRect()
      ring.style.top = `${rect.top - 6}px`
      ring.style.left = `${rect.left - 6}px`
      ring.style.width = `${rect.width + 12}px`
      ring.style.height = `${rect.height + 12}px`
    }

    const tick = (now: number) => {
      // A form that remounts once its data arrives replaces the element: look for the new one.
      if (element && !element.isConnected) {
        element = null
        phase = 'find'
      }
      if (phase === 'find') {
        element = document.querySelector<HTMLElement>(`[data-help~="${section}"]`)
        if (element) {
          phase = 'settle'
          lastTop = element.getBoundingClientRect().top
          stableSince = now
        } else if (now - started > FIND_FOR_MS) {
          finish()
          return
        }
      } else if (phase === 'settle' && element) {
        const top = element.getBoundingClientRect().top
        if (Math.abs(top - lastTop) > 1) {
          lastTop = top
          stableSince = now
        } else if (now - stableSince > SETTLE_MS || now - started > FIND_FOR_MS) {
          const tall = element.getBoundingClientRect().height > window.innerHeight * 0.7
          element.style.scrollMarginTop = `${TOP_BAR}px`
          element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: tall ? 'start' : 'center' })
          phase = 'lit'
          litUntil = now + LIT_MS
          setLit(true)
        }
      } else if (element) {
        if (now > litUntil) {
          finish()
          return
        }
        place()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      setLit(false)
    }
  }, [section, reduced])

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {lit && (
        <motion.div
          ref={ringRef}
          aria-hidden
          className="pointer-events-none fixed z-[110] rounded-xl ring-2 ring-ember"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={reduced ? STILL : PULSE}
          exit={{ opacity: 0 }}
          transition={PULSE_TRANSITION}
        />
      )}
    </AnimatePresence>,
    document.body,
  )
}
