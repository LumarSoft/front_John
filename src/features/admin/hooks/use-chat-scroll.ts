import { useEffect, useRef, useState } from 'react'

// How close to the end still counts as "reading the latest message".
const BOTTOM_THRESHOLD_PX = 80
// Room left above the unread divider when a chat opens on it.
const ANCHOR_OFFSET_PX = 56

/**
 * WhatsApp-style thread scrolling: open at the unread divider (or the latest
 * message), follow new ones only while the reader is at the bottom, and
 * otherwise count them for the "scroll down" button instead of yanking the
 * view away from older messages.
 */
export function useChatScroll(messageCount: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  // While true, the view stays on the unread divider as photos above it load.
  const anchoredRef = useRef(false)
  const seenCountRef = useRef(0)
  const lastScrollTopRef = useRef(0)
  const [atBottom, setAtBottom] = useState(true)
  const [unseen, setUnseen] = useState(0)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    anchoredRef.current = false
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  }

  const scrollToAnchor = () => {
    const el = containerRef.current
    const anchor = anchorRef.current
    if (!el || !anchor) return
    const top = anchor.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
    el.scrollTop = Math.max(0, top - ANCHOR_OFFSET_PX)
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD_PX
  }

  // Only the reader scrolling up unpins the view: content growing below (a
  // photo loading) also leaves it short of the end, but must keep following.
  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distance < BOTTOM_THRESHOLD_PX) atBottomRef.current = true
    else if (el.scrollTop < lastScrollTopRef.current) atBottomRef.current = false
    lastScrollTopRef.current = el.scrollTop
    setAtBottom(atBottomRef.current)
    if (atBottomRef.current) setUnseen(0)
  }

  // Any wheel, touch, key or scrollbar drag on the thread is the reader taking over.
  const releaseAnchor = () => {
    anchoredRef.current = false
  }

  useEffect(() => {
    const previous = seenCountRef.current
    seenCountRef.current = messageCount
    if (messageCount <= previous) return
    if (previous === 0) {
      if (anchorRef.current) {
        anchoredRef.current = true
        scrollToAnchor()
      } else {
        scrollToBottom('auto')
      }
    } else if (atBottomRef.current) {
      scrollToBottom()
    } else {
      // A timer keeps the state update out of the effect body (react-hooks rule).
      const timer = setTimeout(() => setUnseen(n => n + messageCount - previous), 0)
      return () => clearTimeout(timer)
    }
  }, [messageCount])

  // Photos and audio players grow the thread after it renders: stay on the
  // unread divider or pinned to the latest message while that happens.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(() => {
      if (anchoredRef.current) scrollToAnchor()
      else if (atBottomRef.current) scrollToBottom('auto')
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  /** Brings a message to the middle of the view (a search result). */
  const scrollToMessage = (messageId: number) => {
    const target = contentRef.current?.querySelector(`[data-message-id="${messageId}"]`)
    if (!target) return
    anchoredRef.current = false
    atBottomRef.current = false
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const containerProps = {
    ref: containerRef,
    onScroll,
    onWheel: releaseAnchor,
    onTouchStart: releaseAnchor,
    onMouseDown: releaseAnchor,
    onKeyDown: releaseAnchor,
  }

  return { containerProps, contentRef, anchorRef, atBottom, unseen, scrollToBottom, scrollToMessage }
}
