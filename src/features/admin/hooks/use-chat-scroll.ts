import { useEffect, useRef, useState } from 'react'

// How close to the end still counts as "reading the latest message".
const BOTTOM_THRESHOLD_PX = 80

/**
 * WhatsApp-style thread scrolling: open at the latest message, follow new ones
 * only while the reader is at the bottom, and otherwise count them for the
 * "scroll down" button instead of yanking the view away from older messages.
 */
export function useChatScroll(messageCount: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const seenCountRef = useRef(0)
  const lastScrollTopRef = useRef(0)
  const [atBottom, setAtBottom] = useState(true)
  const [unseen, setUnseen] = useState(0)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
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

  useEffect(() => {
    const previous = seenCountRef.current
    seenCountRef.current = messageCount
    if (messageCount <= previous) return
    if (previous === 0) {
      scrollToBottom('auto')
    } else if (atBottomRef.current) {
      scrollToBottom()
    } else {
      // A timer keeps the state update out of the effect body (react-hooks rule).
      const timer = setTimeout(() => setUnseen(n => n + messageCount - previous), 0)
      return () => clearTimeout(timer)
    }
  }, [messageCount])

  // Photos and audio players grow the thread after it renders; stay pinned to
  // the latest message while that happens, unless the reader scrolled up.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(() => {
      if (atBottomRef.current) scrollToBottom('auto')
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return { containerRef, contentRef, onScroll, atBottom, unseen, scrollToBottom }
}
