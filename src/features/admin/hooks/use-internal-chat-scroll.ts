import { useLayoutEffect, useRef, useState } from 'react'

// How close to the end still counts as "reading the latest message".
const BOTTOM_THRESHOLD_PX = 80
// Room left above the unread divider when a chat opens on it.
const ANCHOR_OFFSET_PX = 48

interface ScrollState {
  /** Id of the oldest message shown: changes when older ones are loaded above. */
  firstId: number | null
  /** Id of the newest message shown: changes when a new one arrives. */
  lastId: number | null
  /** The newest message is the reader's own (they just sent it). */
  lastIsMine: boolean
  /** The chat is loaded and the unread divider, if any, is on screen. */
  ready: boolean
}

/**
 * Scrolling of an internal chat: opens on the unread divider (or the latest
 * message), follows new messages while the reader is at the bottom or when
 * they are their own, flags them otherwise, and keeps the view in place when
 * older messages are loaded above.
 */
export function useInternalChatScroll({ firstId, lastId, lastIsMine, ready }: ScrollState) {
  const containerRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const openedRef = useRef(false)
  const shownRef = useRef<{ firstId: number | null; lastId: number | null }>({ firstId: null, lastId: null })
  const restoreRef = useRef<{ height: number; top: number } | null>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [hasNew, setHasNew] = useState(false)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  }

  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD_PX
    setAtBottom(atBottomRef.current)
    if (atBottomRef.current) setHasNew(false)
  }

  /** Call right before loading older messages, so the view stays where it is. */
  const keepPosition = () => {
    const el = containerRef.current
    if (el) restoreRef.current = { height: el.scrollHeight, top: el.scrollTop }
  }

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !ready || lastId === null) return
    const shown = shownRef.current
    shownRef.current = { firstId, lastId }

    if (!openedRef.current) {
      openedRef.current = true
      const anchor = anchorRef.current
      if (anchor) {
        const top = anchor.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
        el.scrollTop = Math.max(0, top - ANCHOR_OFFSET_PX)
        atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD_PX
      } else {
        el.scrollTop = el.scrollHeight
      }
      return
    }

    if (firstId !== shown.firstId && restoreRef.current) {
      el.scrollTop = el.scrollHeight - restoreRef.current.height + restoreRef.current.top
      restoreRef.current = null
    }

    if (lastId !== shown.lastId) {
      if (atBottomRef.current || lastIsMine) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      } else {
        // A timer keeps the state update out of the effect body (react-hooks rule).
        const timer = setTimeout(() => setHasNew(true), 0)
        return () => clearTimeout(timer)
      }
    }
  }, [firstId, lastId, lastIsMine, ready])

  return { containerRef, anchorRef, onScroll, atBottom, hasNew, scrollToBottom, keepPosition }
}
